import classNames from 'classnames';
import ResizeObserver, { type ResizeObserverProps } from '@rc-component/resize-observer';
import * as React from 'react';
import type {
  RangeTimeProps,
  SharedPickerProps,
  SharedTimeProps,
  ValueDate,
} from '../../interface';
import { toArray } from '../../utils/miscUtil';
import PickerContext from '../context';
import Footer, { type FooterProps } from './Footer';
import PopupPanel, { type PopupPanelProps } from './PopupPanel';
import PresetPanel from './PresetPanel';

export type PopupShowTimeConfig<DateType extends object = any> = Omit<
  RangeTimeProps<DateType>,
  'defaultValue' | 'defaultOpenValue' | 'disabledTime'
> &
  Pick<SharedTimeProps<DateType>, 'disabledTime'>;

export interface PopupProps<DateType extends object = any, PresetValue = DateType>
  extends Pick<React.InputHTMLAttributes<HTMLDivElement>, 'onFocus' | 'onBlur'>,
    FooterProps<DateType>,
    PopupPanelProps<DateType> {
  panelRender?: SharedPickerProps['panelRender'];

  // Presets
  presets: ValueDate<DateType>[];
  onPresetHover: (presetValue: PresetValue) => void;
  onPresetSubmit: (presetValue: PresetValue) => void;

  // Range
  activeInfo?: [activeInputLeft: number, activeInputRight: number, selectorWidth: number];
  // Direction
  direction?: 'ltr' | 'rtl';

  // Fill
  /** TimePicker or showTime only */
  defaultOpenValue: DateType;

  // Change
  needConfirm: boolean;
  isInvalid: (date: DateType | DateType[]) => boolean;
  onOk: VoidFunction;

  onPanelMouseDown?: React.MouseEventHandler<HTMLDivElement>;
}

export default function Popup<DateType extends object = any>(props: PopupProps<DateType>) {
  const {
    panelRender,
    internalMode,
    picker,
    showNow,

    // Range
    range,
    multiple,
    activeInfo = [0, 0, 0],

    // Presets
    presets,
    onPresetHover,
    onPresetSubmit,

    // Focus
    onFocus,
    onBlur,
    onPanelMouseDown,

    // Direction
    direction,

    // Change
    value,
    onSelect,
    isInvalid,
    defaultOpenValue,
    onOk,
    onSubmit,
  } = props;

  const { prefixCls } = React.useContext(PickerContext);
  const panelPrefixCls = `${prefixCls}-panel`;

  const rtl = direction === 'rtl';

  // ========================= Refs =========================
  const arrowRef = React.useRef<HTMLDivElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // ======================== Offset ========================
  const [containerWidth, setContainerWidth] = React.useState<number>(0);
  const [containerOffset, setContainerOffset] = React.useState<number>(0);
  const [arrowOffset, setArrowOffset] = React.useState<number>(0);

  const onResize: ResizeObserverProps['onResize'] = (info) => {
    if (info.width) {
      setContainerWidth(info.width);
    }
  };

  const [activeInputLeft, activeInputRight, selectorWidth] = activeInfo;
  const [retryTimes, setRetryTimes] = React.useState(0);

  React.useEffect(() => {
    setRetryTimes(10);
  }, [activeInputLeft]);

  React.useEffect(() => {
    // `activeOffset` is always align with the active input element
    // So we need only check container contains the `activeOffset`
    if (range && wrapperRef.current) {
      // Offset in case container has border radius
      const arrowWidth = arrowRef.current?.offsetWidth || 0;

      // Arrow Offset
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      if (!wrapperRect.height || wrapperRect.right < 0) {
        setRetryTimes((times) => Math.max(0, times - 1));
        return;
      }

      const nextArrowOffset =
        (rtl ? activeInputRight - arrowWidth : activeInputLeft) - wrapperRect.left;
      setArrowOffset(nextArrowOffset);

      // Container Offset
      if (containerWidth && containerWidth < selectorWidth) {
        const offset = rtl
          ? wrapperRect.right - (activeInputRight - arrowWidth + containerWidth)
          : activeInputLeft + arrowWidth - wrapperRect.left - containerWidth;

        const safeOffset = Math.max(0, offset);
        setContainerOffset(safeOffset);
      } else {
        setContainerOffset(0);
      }
    }
  }, [retryTimes, rtl, containerWidth, activeInputLeft, activeInputRight, selectorWidth, range]);

  // ======================== Custom ========================
  function filterEmpty<T>(list: T[]) {
    return list.filter((item) => item);
  }

  const valueList = React.useMemo(() => filterEmpty(toArray(value)), [value]);

  const isTimePickerEmptyValue = picker === 'time' && !valueList.length;

  const footerSubmitValue = React.useMemo(() => {
    if (isTimePickerEmptyValue) {
      return filterEmpty([defaultOpenValue]);
    }
    return valueList;
  }, [isTimePickerEmptyValue, valueList, defaultOpenValue]);

  const popupPanelValue = isTimePickerEmptyValue ? defaultOpenValue : valueList;

  const disableSubmit = React.useMemo(() => {
    // Empty is invalid
    if (!footerSubmitValue.length) {
      return true;
    }

    return footerSubmitValue.some((val) => isInvalid(val));
  }, [footerSubmitValue, isInvalid]);

  const onFooterSubmit = () => {
    // For TimePicker, we will additional trigger the value update
    if (isTimePickerEmptyValue) {
      onSelect(defaultOpenValue);
    }

    onOk();
    onSubmit();
  };

  let mergedNodes: React.ReactNode = (
    <div className={`${prefixCls}-panel-layout`}>
      {/* `any` here since PresetPanel is reused for both Single & Range Picker which means return type is not stable */}
      <PresetPanel<any>
        prefixCls={prefixCls}
        presets={presets}
        onClick={onPresetSubmit}
        onHover={onPresetHover}
      />
      <div>
        <PopupPanel {...props} value={popupPanelValue} />
        <Footer
          {...props}
          showNow={multiple ? false : showNow}
          invalid={disableSubmit}
          onSubmit={onFooterSubmit}
        />
      </div>
    </div>
  );

  if (panelRender) {
    mergedNodes = panelRender(mergedNodes);
  }

  // ======================== Render ========================
  const containerPrefixCls = `${panelPrefixCls}-container`;

  const marginLeft = 'marginLeft';
  const marginRight = 'marginRight';

  // Container
  let renderNode = (
    <div
      onMouseDown={onPanelMouseDown}
      tabIndex={-1}
      className={classNames(
        containerPrefixCls,
        // Used for Today Button style, safe to remove if no need
        `${prefixCls}-${internalMode}-panel-container`,
      )}
      style={{
        [rtl ? marginRight : marginLeft]: containerOffset,
        [rtl ? marginLeft : marginRight]: 'auto',
      }}
      // Still wish not to lose focus on mouse down
      // onMouseDown={(e) => {
      //   // e.preventDefault();
      // }}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {mergedNodes}
    </div>
  );

  if (range) {
    renderNode = (
      <div
        onMouseDown={onPanelMouseDown}
        ref={wrapperRef}
        className={classNames(`${prefixCls}-range-wrapper`, `${prefixCls}-${picker}-range-wrapper`)}
      >
        <div ref={arrowRef} className={`${prefixCls}-range-arrow`} style={{ left: arrowOffset }} />

        {/* Watch for container size */}
        <ResizeObserver onResize={onResize}>{renderNode}</ResizeObserver>
      </div>
    );
  }

  return renderNode;
}

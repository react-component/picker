import classNames from 'classnames';
import ResizeObserver, { type ResizeObserverProps } from 'rc-resize-observer';
import * as React from 'react';
import type { SharedPickerProps, ValueDate } from '../../interface';
import PickerContext from '../context';
import type { RangeValueType } from '../RangePicker';
import Footer, { type FooterProps } from './Footer';
import PopupPanel, { type PopupPanelProps } from './PopupPanel';
import PresetPanel from './PresetPanel';

export interface PopupProps<DateType = any, PresetValue = DateType>
  extends Pick<React.HTMLAttributes<HTMLDivElement>, 'onFocus' | 'onBlur'>,
    FooterProps<DateType>,
    PopupPanelProps<DateType> {
  panelRender?: SharedPickerProps['panelRender'];

  // Presets
  presets: ValueDate<DateType>[];
  onPresetHover: (presetValue: PresetValue) => void;
  onPresetSubmit: (presetValue: RangeValueType<DateType>) => void;

  // Range
  range?: boolean;
  activeOffset?: number;

  // Direction
  direction?: 'ltr' | 'rtl';

  // Change
  needConfirm: boolean;
  isInvalid: (date: DateType) => boolean;
}

export default function Popup<DateType = any>(props: PopupProps<DateType>) {
  const {
    panelRender,
    internalMode,
    picker,
    showNow,

    // Range
    range,
    multiple,
    activeOffset = 0,

    // Presets
    presets,
    onPresetHover,
    onPresetSubmit,

    // Focus
    onFocus,
    onBlur,

    // Direction
    direction,

    // Change
    value,
    isInvalid,
  } = props;

  const { prefixCls } = React.useContext(PickerContext);
  const panelPrefixCls = `${prefixCls}-panel`;

  const rtl = direction === 'rtl';

  // ========================= Refs =========================
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // ======================== Offset ========================
  const [containerWidth, setContainerWidth] = React.useState<number>(0);
  const [containerOffset, setContainerOffset] = React.useState<number>(0);

  const onResize: ResizeObserverProps['onResize'] = (info) => {
    if (info.offsetWidth) {
      setContainerWidth(info.offsetWidth);
    }
  };

  React.useEffect(() => {
    // `activeOffset` is always align with the active input element
    // So we need only check container contains the `activeOffset`
    if (range) {
      if (activeOffset + containerWidth < wrapperRef.current?.offsetWidth) {
        setContainerOffset(activeOffset);
      } else {
        setContainerOffset(0);
      }
    }
  }, [containerWidth, activeOffset, range]);

  // ======================== Custom ========================
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
        <PopupPanel {...props} onChange={null} />
        <Footer
          {...props}
          showNow={multiple ? false : showNow}
          invalid={!value || isInvalid(value)}
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
        ref={wrapperRef}
        className={classNames(`${prefixCls}-range-wrapper`, `${prefixCls}-${picker}-range-wrapper`)}
      >
        <div
          className={`${prefixCls}-range-arrow`}
          style={{ [rtl ? 'right' : 'left']: activeOffset }}
        />

        {/* Watch for container size */}
        <ResizeObserver onResize={onResize}>{renderNode}</ResizeObserver>
      </div>
    );
  }

  return renderNode;
}

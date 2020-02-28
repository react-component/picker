/**
 * Removed:
 *  - getCalendarContainer: use `getPopupContainer` instead
 *  - onOk
 *
 * New Feature:
 *  - picker
 *  - allowEmpty
 *  - selectable
 *
 * Tips: Should add faq about `datetime` mode with `defaultValue`
 */

import * as React from 'react';
import classNames from 'classnames';
import { AlignType } from 'rc-trigger/lib/interface';
import warning from 'rc-util/lib/warning';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import PickerPanel, {
  PickerPanelBaseProps,
  PickerPanelDateProps,
  PickerPanelTimeProps,
} from './PickerPanel';
import PickerTrigger from './PickerTrigger';
import { isEqual } from './utils/dateUtil';
import getDataOrAriaProps, { toArray } from './utils/miscUtil';
import PanelContext, { ContextOperationRefProps } from './PanelContext';
import { PickerMode } from './interface';
import {
  getDefaultFormat,
  getInputSize,
  elementsContains,
} from './utils/uiUtil';
import usePickerInput from './hooks/usePickerInput';
import useTextValueMapping from './hooks/useTextValueMapping';
import useValueTexts from './hooks/useValueTexts';

export interface PickerRefConfig {
  focus: () => void;
  blur: () => void;
}

export interface PickerSharedProps<DateType> extends React.AriaAttributes {
  dropdownClassName?: string;
  dropdownAlign?: AlignType;
  popupStyle?: React.CSSProperties;
  transitionName?: string;
  placeholder?: string;
  allowClear?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  /** Make input readOnly to avoid popup keyboard in mobile */
  inputReadOnly?: boolean;

  // Value
  format?: string | string[];

  // Render
  suffixIcon?: React.ReactNode;
  clearIcon?: React.ReactNode;
  prevIcon?: React.ReactNode;
  nextIcon?: React.ReactNode;
  superPrevIcon?: React.ReactNode;
  superNextIcon?: React.ReactNode;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;

  // Events
  onChange?: (value: DateType | null, dateString: string) => void;
  onOpenChange?: (open: boolean) => void;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>;

  // Internal
  /** @private Internal usage, do not use in production mode!!! */
  pickerRef?: React.MutableRefObject<PickerRefConfig>;

  // WAI-ARIA
  role?: string;
  name?: string;

  direction?: 'ltr' | 'rtl';
}

type OmitPanelProps<Props> = Omit<
  Props,
  'onChange' | 'hideHeader' | 'pickerValue' | 'onPickerValueChange'
>;

export interface PickerBaseProps<DateType>
  extends PickerSharedProps<DateType>,
    OmitPanelProps<PickerPanelBaseProps<DateType>> {}

export interface PickerDateProps<DateType>
  extends PickerSharedProps<DateType>,
    OmitPanelProps<PickerPanelDateProps<DateType>> {}

export interface PickerTimeProps<DateType>
  extends PickerSharedProps<DateType>,
    Omit<OmitPanelProps<PickerPanelTimeProps<DateType>>, 'format'> {
  picker: 'time';
  /**
   * @deprecated Please use `defaultValue` directly instead
   * since `defaultOpenValue` will confuse user of current value status
   */
  defaultOpenValue?: DateType;
}

export type PickerProps<DateType> =
  | PickerBaseProps<DateType>
  | PickerDateProps<DateType>
  | PickerTimeProps<DateType>;

interface MergedPickerProps<DateType>
  extends Omit<
    PickerBaseProps<DateType> &
      PickerDateProps<DateType> &
      PickerTimeProps<DateType>,
    'picker'
  > {
  picker?: PickerMode;
}

function InnerPicker<DateType>(props: PickerProps<DateType>) {
  const {
    prefixCls = 'rc-picker',
    style,
    className,
    dropdownClassName,
    dropdownAlign,
    popupStyle,
    transitionName,
    generateConfig,
    locale,
    inputReadOnly,
    allowClear,
    autoFocus,
    showTime,
    picker = 'date',
    format,
    use12Hours,
    value,
    defaultValue,
    open,
    defaultOpen,
    defaultOpenValue,
    suffixIcon,
    clearIcon,
    disabled,
    disabledDate,
    placeholder,
    getPopupContainer,
    pickerRef,
    onChange,
    onOpenChange,
    onFocus,
    onBlur,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    onContextMenu,
    onClick,
    direction,
  } = props as MergedPickerProps<DateType>;

  const inputRef = React.useRef<HTMLInputElement>(null);

  const needConfirmButton: boolean =
    (picker === 'date' && !!showTime) || picker === 'time';

  // ============================= State =============================
  const formatList = toArray(
    getDefaultFormat(format, picker, showTime, use12Hours),
  );

  // Panel ref
  const panelDivRef = React.useRef<HTMLDivElement>(null);
  const inputDivRef = React.useRef<HTMLDivElement>(null);

  // Real value
  const [mergedValue, setInnerValue] = useMergedState(null, {
    value,
    defaultValue,
  });

  // Selected value
  const [selectedValue, setSelectedValue] = React.useState<DateType | null>(
    mergedValue,
  );

  // Operation ref
  const operationRef: React.MutableRefObject<ContextOperationRefProps | null> = React.useRef<
    ContextOperationRefProps
  >(null);

  // Open
  const [mergedOpen, triggerInnerOpen] = useMergedState(false, {
    value: open,
    defaultValue: defaultOpen,
    postState: postOpen => (disabled ? false : postOpen),
    onChange: newOpen => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      }

      if (!newOpen && operationRef.current && operationRef.current.onClose) {
        operationRef.current.onClose();
      }
    },
  });

  // ============================= Text ==============================
  const valueTexts = useValueTexts(selectedValue, {
    formatList,
    generateConfig,
    locale,
  });

  const [text, triggerTextChange, resetText] = useTextValueMapping({
    valueTexts,
    onTextChange: newText => {
      const inputDate = generateConfig.locale.parse(
        locale.locale,
        newText,
        formatList,
      );
      if (inputDate && (!disabledDate || !disabledDate(inputDate))) {
        setSelectedValue(inputDate);
      }
    },
  });

  // ============================ Trigger ============================
  const triggerChange = (newValue: DateType | null) => {
    setSelectedValue(newValue);
    setInnerValue(newValue);

    if (onChange && !isEqual(generateConfig, mergedValue, newValue)) {
      onChange(
        newValue,
        newValue
          ? generateConfig.locale.format(locale.locale, newValue, formatList[0])
          : '',
      );
    }
  };

  const triggerOpen = (
    newOpen: boolean,
    preventChangeEvent: boolean = false,
  ) => {
    triggerInnerOpen(newOpen);
    if (!newOpen && !preventChangeEvent) {
      triggerChange(selectedValue);
    }
  };

  const forwardKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (mergedOpen && operationRef.current && operationRef.current.onKeyDown) {
      // Let popup panel handle keyboard
      return operationRef.current.onKeyDown(e);
    }

    /* istanbul ignore next */
    /* eslint-disable no-lone-blocks */
    {
      warning(
        false,
        'Picker not correct forward KeyDown operation. Please help to fire issue about this.',
      );
      return false;
    }
  };

  const onInternalMouseUp: React.MouseEventHandler<HTMLDivElement> = (
    ...args
  ) => {
    if (onMouseUp) {
      onMouseUp(...args);
    }

    if (inputRef.current) {
      inputRef.current.focus();
      triggerOpen(true);
    }
  };

  // ============================= Input =============================
  const [inputProps, { focused, typing }] = usePickerInput({
    blurToCancel: needConfirmButton,
    open: mergedOpen,
    triggerOpen,
    forwardKeyDown,
    isClickOutside: target =>
      !elementsContains(
        [panelDivRef.current, inputDivRef.current],
        target as HTMLElement,
      ),
    onSubmit: () => {
      triggerChange(selectedValue);
      triggerOpen(false, true);
      resetText();
    },
    onCancel: () => {
      triggerOpen(false, true);
      setSelectedValue(mergedValue);
      resetText();
    },
    onFocus,
    onBlur,
  });

  // ============================= Sync ==============================
  // Close should sync back with text value
  React.useEffect(() => {
    if (!mergedOpen) {
      setSelectedValue(mergedValue);

      if (!valueTexts.length || valueTexts[0] === '') {
        triggerTextChange('');
      } else if (!valueTexts.includes(text)) {
        resetText();
      }
    }
  }, [mergedOpen, valueTexts]);

  // Sync innerValue with control mode
  React.useEffect(() => {
    // Sync select value
    setSelectedValue(mergedValue);
  }, [mergedValue]);

  // ============================ Private ============================
  if (pickerRef) {
    pickerRef.current = {
      focus: () => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      },
      blur: () => {
        if (inputRef.current) {
          inputRef.current.blur();
        }
      },
    };
  }

  // ============================= Panel =============================
  const panelProps = {
    // Remove `picker` & `format` here since TimePicker is little different with other panel
    ...(props as Omit<MergedPickerProps<DateType>, 'picker' | 'format'>),
    className: undefined,
    style: undefined,
    pickerValue: undefined,
    onPickerValueChange: undefined,
  };

  const panel = (
    <div
      className={`${prefixCls}-panel-container`}
      onMouseDown={e => {
        e.preventDefault();
      }}
    >
      <PickerPanel<DateType>
        {...panelProps}
        generateConfig={generateConfig}
        className={classNames({
          [`${prefixCls}-panel-focused`]: !typing,
        })}
        value={selectedValue}
        locale={locale}
        tabIndex={-1}
        onChange={setSelectedValue}
        direction={direction}
      />
    </div>
  );

  let suffixNode: React.ReactNode;
  if (suffixIcon) {
    suffixNode = <span className={`${prefixCls}-suffix`}>{suffixIcon}</span>;
  }

  let clearNode: React.ReactNode;
  if (allowClear && mergedValue && !disabled) {
    clearNode = (
      <span
        onMouseDown={e => {
          e.preventDefault();
          e.stopPropagation();
          triggerChange(null);
          triggerOpen(false, true);
        }}
        className={`${prefixCls}-clear`}
      >
        {clearIcon || <span className={`${prefixCls}-clear-btn`} />}
      </span>
    );
  }

  // ============================ Warning ============================
  if (process.env.NODE_ENV !== 'production') {
    warning(
      !defaultOpenValue,
      '`defaultOpenValue` may confuse user for the current value status. Please use `defaultValue` instead.',
    );
  }

  // ============================ Return =============================
  const onContextSelect = (
    date: DateType,
    type: 'key' | 'mouse' | 'submit',
  ) => {
    if (type === 'submit' || (type !== 'key' && !needConfirmButton)) {
      // triggerChange will also update selected values
      triggerChange(date);
      triggerOpen(false, true);
    }
  };
  const popupPlacement = direction === 'rtl' ? 'bottomRight' : 'bottomLeft';

  return (
    <PanelContext.Provider
      value={{
        operationRef,
        hideHeader: picker === 'time',
        panelRef: panelDivRef,
        onSelect: onContextSelect,
        open: mergedOpen,
        defaultOpenValue,
      }}
    >
      <PickerTrigger
        visible={mergedOpen}
        popupElement={panel}
        popupStyle={popupStyle}
        prefixCls={prefixCls}
        dropdownClassName={dropdownClassName}
        dropdownAlign={dropdownAlign}
        getPopupContainer={getPopupContainer}
        transitionName={transitionName}
        popupPlacement={popupPlacement}
        direction={direction}
      >
        <div
          className={classNames(prefixCls, className, {
            [`${prefixCls}-disabled`]: disabled,
            [`${prefixCls}-focused`]: focused,
            [`${prefixCls}-rtl`]: direction === 'rtl',
          })}
          style={style}
          onMouseDown={onMouseDown}
          onMouseUp={onInternalMouseUp}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onContextMenu={onContextMenu}
          onClick={onClick}
        >
          <div className={`${prefixCls}-input`} ref={inputDivRef}>
            <input
              disabled={disabled}
              readOnly={inputReadOnly || !typing}
              value={text}
              onChange={e => {
                triggerTextChange(e.target.value);
              }}
              autoFocus={autoFocus}
              placeholder={placeholder}
              ref={inputRef}
              {...inputProps}
              size={getInputSize(picker, formatList[0])}
              {...getDataOrAriaProps(props)}
            />
            {suffixNode}
            {clearNode}
          </div>
        </div>
      </PickerTrigger>
    </PanelContext.Provider>
  );
}

// Wrap with class component to enable pass generic with instance method
class Picker<DateType> extends React.Component<PickerProps<DateType>> {
  pickerRef = React.createRef<PickerRefConfig>();

  focus = () => {
    if (this.pickerRef.current) {
      this.pickerRef.current.focus();
    }
  };

  blur = () => {
    if (this.pickerRef.current) {
      this.pickerRef.current.blur();
    }
  };

  render() {
    return (
      <InnerPicker<DateType>
        {...this.props}
        pickerRef={this.pickerRef as React.MutableRefObject<PickerRefConfig>}
      />
    );
  }
}

export default Picker;

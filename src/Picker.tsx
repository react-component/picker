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
import { getDefaultFormat, getInputSize } from './utils/uiUtil';
import usePickerInput from './hooks/usePickerInput';
import useTextValueMapping from './hooks/useTextValueMapping';

export interface PickerRefConfig {
  focus: () => void;
  blur: () => void;
  open: () => void;
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
}

export interface PickerBaseProps<DateType>
  extends PickerSharedProps<DateType>,
    Omit<PickerPanelBaseProps<DateType>, 'onChange' | 'hideHeader'> {}

export interface PickerDateProps<DateType>
  extends PickerSharedProps<DateType>,
    Omit<PickerPanelDateProps<DateType>, 'onChange' | 'hideHeader'> {}

export interface PickerTimeProps<DateType>
  extends PickerSharedProps<DateType>,
    Omit<
      PickerPanelTimeProps<DateType>,
      'onChange' | 'format' | 'hideHeader'
    > {}

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
    picker,
    format,
    use12Hours,
    value,
    defaultValue,
    open,
    defaultOpen,
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
  } = props as MergedPickerProps<DateType>;

  const inputRef = React.useRef<HTMLInputElement>(null);

  // ============================= State =============================
  const formatList = toArray(
    getDefaultFormat(format, picker, showTime, use12Hours),
  );

  // Panel ref
  const panelDivRef = React.useRef<HTMLDivElement>(null);
  const inputDivRef = React.useRef<HTMLDivElement>(null);

  // Real value
  const [innerValue, setInnerValue] = React.useState<DateType | null>(() => {
    if (value !== undefined) {
      return value;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    return null;
  });
  const mergedValue = value !== undefined ? value : innerValue;

  // Selected value
  const [
    selectedValue,
    setInternalSelectedValue,
  ] = React.useState<DateType | null>(mergedValue);

  // Operation ref
  const operationRef: React.MutableRefObject<ContextOperationRefProps | null> = React.useRef<
    ContextOperationRefProps
  >(null);

  // Trigger
  const [innerOpen, setInnerOpen] = React.useState<boolean>(() => {
    if (defaultOpen !== undefined) {
      return defaultOpen;
    }
    return false;
  });
  let mergedOpen: boolean;
  if (disabled) {
    mergedOpen = false;
  } else {
    mergedOpen = typeof open === 'boolean' ? open : innerOpen;
  }

  const triggerOpen = (newOpen: boolean) => {
    if (mergedOpen !== newOpen) {
      setInnerOpen(newOpen);
      if (onOpenChange) {
        onOpenChange(newOpen);
      }

      if (!newOpen && operationRef.current && operationRef.current.onClose) {
        operationRef.current.onClose();
      }
    }
  };

  // =========================== Formatter ===========================
  const setSelectedValue = (newDate: DateType | null) => {
    setInternalSelectedValue(newDate);
  };

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

  const forwardKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (mergedOpen && operationRef.current && operationRef.current.onKeyDown) {
      // Let popup panel handle keyboard
      return operationRef.current.onKeyDown(e);
    }
    return false;
  };

  const triggerClose = () => {
    triggerOpen(false);
    setInnerValue(selectedValue);
    triggerChange(selectedValue);
  };

  // ============================= Text ==============================
  const valueTexts = React.useMemo<string[]>(() => {
    if (!selectedValue) {
      return [''];
    }
    return formatList.map(subFormat =>
      generateConfig.locale.format(locale.locale, selectedValue, subFormat),
    );
  }, [selectedValue]);

  const [text, setText, resetText] = useTextValueMapping({
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

  // ============================= Input =============================
  const [inputProps, { focused, typing }] = usePickerInput({
    open: mergedOpen,
    triggerOpen,
    triggerClose,
    forwardKeyDown,
    isClickOutside: target =>
      !!(
        panelDivRef.current &&
        !panelDivRef.current.contains(target as Node) &&
        inputDivRef.current &&
        !inputDivRef.current.contains(target as Node) &&
        onOpenChange
      ),
    onSubmit: () => {
      triggerChange(selectedValue);
    },
    onCancel: () => {
      triggerChange(mergedValue);
      setSelectedValue(mergedValue);
    },
    onFocus,
    onBlur,
  });

  // ============================= Sync ==============================
  // Close should sync back with text value
  React.useEffect(() => {
    if (!mergedOpen) {
      resetText();
    }
  }, [mergedOpen]);

  // Sync innerValue with control mode
  React.useEffect(() => {
    if (!isEqual(generateConfig, mergedValue, innerValue)) {
      // Sync inner & select value
      setInnerValue(mergedValue);
      setSelectedValue(mergedValue);
    }
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
      open: () => {
        triggerOpen(true);
      },
    };
  }

  // ============================= Panel =============================
  const panelProps = {
    // Remove `picker` & `format` here since TimePicker is little different with other panel
    ...(props as Omit<MergedPickerProps<DateType>, 'picker' | 'format'>),
    className: undefined,
    style: undefined,
  };

  const panel = (
    <PickerPanel<DateType>
      {...panelProps}
      generateConfig={generateConfig}
      className={classNames({
        [`${prefixCls}-panel-focused`]: !typing,
      })}
      value={selectedValue}
      locale={locale}
      tabIndex={-1}
      onMouseDown={e => {
        e.preventDefault();
      }}
      onChange={setSelectedValue}
    />
  );

  let suffixNode: React.ReactNode;
  if (suffixIcon) {
    suffixNode = <span className={`${prefixCls}-suffix`}>{suffixIcon}</span>;
  }

  let clearNode: React.ReactNode;
  if (allowClear && mergedValue && !disabled) {
    clearNode = (
      <span
        onClick={e => {
          e.stopPropagation();
          triggerChange(null);
        }}
        className={`${prefixCls}-clear`}
      >
        {clearIcon || <span className={`${prefixCls}-clear-btn`} />}
      </span>
    );
  }

  return (
    <PanelContext.Provider
      value={{
        operationRef,
        hideHeader: picker === 'time',
        panelRef: panelDivRef,
      }}
    >
      <div
        className={classNames(prefixCls, className, {
          [`${prefixCls}-disabled`]: disabled,
          [`${prefixCls}-focused`]: focused,
        })}
        style={style}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onContextMenu={onContextMenu}
        onClick={onClick}
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
        >
          <div className={`${prefixCls}-input`} ref={inputDivRef}>
            <input
              disabled={disabled}
              readOnly={inputReadOnly || !typing}
              value={text}
              onChange={e => {
                setText(e.target.value);
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
        </PickerTrigger>
      </div>
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

  open = () => {
    if (this.pickerRef.current) {
      this.pickerRef.current.open();
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

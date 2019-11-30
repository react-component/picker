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
import KeyCode from 'rc-util/lib/KeyCode';
import classNames from 'classnames';
import { AlignType } from 'rc-trigger/lib/interface';
import PickerPanel, {
  PickerPanelBaseProps,
  PickerPanelDateProps,
  PickerPanelTimeProps,
} from './PickerPanel';
import PickerTrigger from './PickerTrigger';
import { isEqual } from './utils/dateUtil';
import { toArray } from './utils/miscUtil';
import PanelContext, { ContextOperationRefProps } from './PanelContext';
import { PickerMode } from './interface';
import {
  getDefaultFormat,
  getInputSize,
  addGlobalMouseDownEvent,
} from './utils/uiUtil';

export interface PickerSharedProps<DateType> {
  dropdownClassName?: string;
  dropdownAlign?: AlignType;
  popupStyle?: React.CSSProperties;
  transitionName?: string;
  placeholder?: string;
  allowClear?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  open?: boolean;
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

  // Internal
  /** @private Internal usage, do not use in production mode!!! */
  inputRef?: React.Ref<HTMLInputElement>;
}

export interface PickerBaseProps<DateType>
  extends PickerSharedProps<DateType>,
    Omit<PickerPanelBaseProps<DateType>, 'onChange'> {}

export interface PickerDateProps<DateType>
  extends PickerSharedProps<DateType>,
    Omit<PickerPanelDateProps<DateType>, 'onChange'> {}

export interface PickerTimeProps<DateType>
  extends PickerSharedProps<DateType>,
    Omit<PickerPanelTimeProps<DateType>, 'onChange' | 'format'> {}

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
    suffixIcon,
    clearIcon,
    disabled,
    placeholder,
    getPopupContainer,
    inputRef,
    onChange,
    onOpenChange,
    onFocus,
    onBlur,
  } = props as MergedPickerProps<DateType>;

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

  // Text
  const [textValue, setTextValue] = React.useState<string>(
    selectedValue
      ? generateConfig.locale.format(
          locale.locale,
          selectedValue,
          formatList[0],
        )
      : '',
  );
  const [typing, setTyping] = React.useState(false);

  /** Similar as `setTextValue` but accept `DateType` and convert into string */
  const setDateText = (date: DateType | null) => {
    setTextValue(
      date === null
        ? ''
        : generateConfig.locale.format(locale.locale, date, formatList[0]),
    );
  };

  // Operation ref
  const operationRef: React.MutableRefObject<ContextOperationRefProps | null> = React.useRef<
    ContextOperationRefProps
  >(null);

  // Trigger
  const [innerOpen, setInnerOpen] = React.useState<boolean>(false);
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

  // Focus
  const [focused, setFocused] = React.useState(false);

  // ============================= Value =============================
  const isSameTextDate = (text: string, date: DateType | null) => {
    if (date === null) {
      return !text;
    }

    const inputDate = generateConfig.locale.parse(
      locale.locale,
      text,
      formatList,
    );
    return isEqual(generateConfig, inputDate, date);
  };

  // =========================== Formatter ===========================
  const setSelectedValue = (newDate: DateType | null) => {
    if (!isSameTextDate(textValue, newDate)) {
      setDateText(newDate);
    }
    setInternalSelectedValue(newDate);
  };

  const onInputMouseDown: React.MouseEventHandler<HTMLInputElement> = () => {
    triggerOpen(true);
    setTyping(true);
  };

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const text = e.target.value;
    setTextValue(text);

    const inputDate = generateConfig.locale.parse(
      locale.locale,
      text,
      formatList,
    );
    if (inputDate) {
      setSelectedValue(inputDate);
    }
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
    if (
      !typing &&
      mergedOpen &&
      operationRef.current &&
      operationRef.current.onKeyDown
    ) {
      // Let popup panel handle keyboard
      return operationRef.current.onKeyDown(e);
    }
    return false;
  };

  const onInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    switch (e.which) {
      case KeyCode.ENTER: {
        if (!mergedOpen) {
          triggerOpen(true);
        } else {
          triggerChange(selectedValue);
          triggerOpen(false);
          setTyping(true);
        }
        return;
      }

      case KeyCode.TAB: {
        if (typing && mergedOpen && !e.shiftKey) {
          setTyping(false);
          e.preventDefault();
        } else if (!typing && mergedOpen) {
          if (!forwardKeyDown(e) && e.shiftKey) {
            setTyping(true);
            e.preventDefault();
          }
        }
        return;
      }

      case KeyCode.ESC: {
        triggerChange(mergedValue);
        setSelectedValue(mergedValue);
        triggerOpen(false);
        setTyping(true);
        return;
      }
    }

    if (!mergedOpen && ![KeyCode.SHIFT].includes(e.which)) {
      triggerOpen(true);
    } else {
      // Let popup panel handle keyboard
      forwardKeyDown(e);
    }
  };

  const onInputFocus: React.FocusEventHandler<HTMLInputElement> = e => {
    setTyping(true);
    setFocused(true);

    if (onFocus) {
      onFocus(e);
    }
  };

  /**
   * We will prevent blur to handle open event when user click outside,
   * since this will repeat trigger `onOpenChange` event.
   */
  const preventBlurRef = React.useRef<boolean>(false);

  const triggerClose = () => {
    triggerOpen(false);
    setInnerValue(selectedValue);
    triggerChange(selectedValue);
  };

  const onInputBlur: React.FocusEventHandler<HTMLInputElement> = e => {
    if (preventBlurRef.current) {
      preventBlurRef.current = false;
      return;
    }

    triggerClose();
    setFocused(false);

    if (onBlur) {
      onBlur(e);
    }
  };

  // ============================= Sync ==============================
  // Close should sync back with text value
  React.useEffect(() => {
    if (!mergedOpen && !isSameTextDate(textValue, mergedValue)) {
      setDateText(mergedValue);
    }
  }, [mergedOpen]);

  // Sync innerValue with control mode
  React.useEffect(() => {
    if (!isEqual(generateConfig, mergedValue, innerValue)) {
      // Sync inner & select value
      setInnerValue(mergedValue);
      setSelectedValue(mergedValue);
    }

    // Sync text
    if (!isSameTextDate(textValue, mergedValue)) {
      setDateText(mergedValue);
    }
  }, [mergedValue]);

  // Global click handler
  React.useEffect(() =>
    addGlobalMouseDownEvent(({ target }: MouseEvent) => {
      if (
        mergedOpen &&
        panelDivRef.current &&
        !panelDivRef.current.contains(target as Node) &&
        inputDivRef.current &&
        !inputDivRef.current.contains(target as Node) &&
        onOpenChange
      ) {
        preventBlurRef.current = true;
        triggerClose();

        // Always set back in case `onBlur` prevented by user
        window.setTimeout(() => {
          preventBlurRef.current = false;
        }, 0);
      }
    }),
  );

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
              onMouseDown={onInputMouseDown}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
              value={textValue}
              onChange={onInputChange}
              onKeyDown={onInputKeyDown}
              autoFocus={autoFocus}
              placeholder={placeholder}
              ref={inputRef}
              size={getInputSize(picker, formatList[0])}
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
  inputRef = React.createRef<HTMLInputElement>();

  focus = () => {
    if (this.inputRef.current) {
      this.inputRef.current.focus();
    }
  };

  blur = () => {
    if (this.inputRef.current) {
      this.inputRef.current.blur();
    }
  };

  render() {
    return <InnerPicker<DateType> {...this.props} inputRef={this.inputRef} />;
  }
}

export default Picker;

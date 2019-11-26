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
import PickerPanel, { PickerPanelProps } from './PickerPanel';
import PickerTrigger from './PickerTrigger';
import { isEqual } from './utils/dateUtil';
import { toArray } from './utils/miscUtil';
import PanelContext, { ContextOperationRefProps } from './PanelContext';

export interface PickerProps<DateType>
  extends Omit<PickerPanelProps<DateType>, 'onChange'> {
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
  getPopupContainer?: (node: HTMLElement) => HTMLElement;

  // Events
  onChange?: (value: DateType | null, dateString: string) => void;
  onOpenChange?: (open: boolean) => void;

  // Internal
  /** @private Internal usage, do not use in production mode!!! */
  inputRef?: React.Ref<HTMLInputElement>;
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
    format = showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD',
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
  } = props;

  // ============================= State =============================
  const formatList = toArray(format);

  // Real value
  const [innerValue, setInnerValue] = React.useState<DateType | null>(() => {
    if (value !== undefined) {
      return value;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    return generateConfig.getNow();
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

  // Trigger
  const [innerOpen, setInnerOpen] = React.useState<boolean>(false);
  let mergedOpen: boolean;
  if (disabled) {
    mergedOpen = false;
  } else {
    mergedOpen = typeof open === 'boolean' ? open : innerOpen;
  }

  // Operation ref
  const operationRef: React.MutableRefObject<ContextOperationRefProps | null> = React.useRef<
    ContextOperationRefProps
  >(null);

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
    setDateText(newDate);
    setInternalSelectedValue(newDate);
  };

  const onInputMouseDown: React.MouseEventHandler<HTMLInputElement> = () => {
    setInnerOpen(true);
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
  const triggerOpen = (newOpen: boolean) => {
    setInnerOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }

    if (!newOpen && operationRef.current && operationRef.current.onClose) {
      operationRef.current.onClose();
    }
  };

  const triggerChange = (newValue: DateType | null) => {
    if (!isSameTextDate(textValue, newValue)) {
      setDateText(newValue);
    }

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

  const onInputFocus = () => {
    setTyping(true);
  };

  const onInputBlur: React.FocusEventHandler<HTMLInputElement> = () => {
    setInnerOpen(false);
    setInnerValue(selectedValue);
    triggerChange(selectedValue);
  };

  // ============================= Sync ==============================
  React.useEffect(() => {
    if (!isEqual(generateConfig, mergedValue, innerValue)) {
      // Sync inner & select value
      setInnerValue(mergedValue);
      setSelectedValue(mergedValue);

      // Sync text
      if (!isSameTextDate(textValue, mergedValue)) {
        setDateText(mergedValue);
      }
    }
  }, [mergedValue]);

  // ============================= Panel =============================
  const panelProps = {
    ...props,
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
      }}
    >
      <div
        className={classNames(prefixCls, className, {
          [`${prefixCls}-disabled`]: disabled,
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
          <div className={`${prefixCls}-input`}>
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
            />
            {suffixIcon}
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

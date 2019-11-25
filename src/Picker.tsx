import * as React from 'react';
import KeyCode from 'rc-util/lib/KeyCode';
import classNames from 'classnames';
import PickerPanel from './PickerPanel';
import PickerTrigger from './PickerTrigger';
import { GenerateConfig } from './generate';
import { Locale, PanelMode, GetNextMode, NullableDateType } from './interface';
import { isEqual } from './utils/dateUtil';
import { toArray } from './utils/miscUtil';
import PanelContext, { ContextOperationRefProps } from './PanelContext';
import { SharedTimeProps } from './panels/TimePanel';
import { DateRender } from './panels/DatePanel/DateBody';

export interface PickerProps<DateType> {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  generateConfig: GenerateConfig<DateType>;
  locale: Locale;
  allowClear?: boolean;
  autoFocus?: boolean;
  showTime?: boolean | SharedTimeProps;
  value?: NullableDateType<DateType>;
  defaultValue?: NullableDateType<DateType>;
  /** [Legacy] Set default display picker view date */
  defaultPickerValue?: DateType;
  open?: boolean;
  format?: string | string[];
  mode?: PanelMode;
  clearIcon?: React.ReactNode;
  dateRender?: DateRender<DateType>;
  onChange?: (value: DateType | null, dateString: string) => void;
  onOpenChange?: (open: boolean) => void;

  /** @private Internal usage, do not use in production mode!!! */
  getNextMode?: GetNextMode;
}

function Picker<DateType>(props: PickerProps<DateType>) {
  const {
    prefixCls = 'rc-picker',
    className,
    style,
    generateConfig,
    locale,
    allowClear,
    autoFocus,
    showTime,
    format = showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD',
    value,
    defaultValue,
    open,
    clearIcon,
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
  const mergedOpen = typeof open === 'boolean' ? open : innerOpen;

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
    if (mergedValue && !isEqual(generateConfig, mergedValue, innerValue)) {
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
  if (allowClear && mergedValue) {
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
      <div className={classNames(prefixCls, className)} style={style}>
        <PickerTrigger
          visible={mergedOpen}
          popupElement={panel}
          prefixCls={prefixCls}
        >
          <div className={`${prefixCls}-input`}>
            <input
              readOnly={!typing}
              onMouseDown={onInputMouseDown}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
              value={textValue}
              onChange={onInputChange}
              onKeyDown={onInputKeyDown}
              autoFocus={autoFocus}
            />
            {clearNode}
          </div>
        </PickerTrigger>
      </div>
    </PanelContext.Provider>
  );
}

export default Picker;

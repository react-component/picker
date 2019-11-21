import * as React from 'react';
import KeyCode from 'rc-util/lib/KeyCode';
import classNames from 'classnames';
import PickerPanel from './PickerPanel';
import PickerTrigger from './PickerTrigger';
import { GenerateConfig } from './utils/generateUtil';
import { Locale } from './interface';
import { isEqual } from './utils/dateUtil';
import { toArray } from './utils/miscUtil';
import PanelContext, { ContextOperationRefProps } from './PanelContext';

export interface PickerProps<DateType> {
  prefixCls?: string;
  generateConfig: GenerateConfig<DateType>;
  locale: Locale;
  value?: DateType;
  open?: boolean;
  format?: string | string[];
  onChange?: (value: DateType) => void;
  onOpenChange?: (open: boolean) => void;
}

function Picker<DateType>(props: PickerProps<DateType>) {
  const {
    prefixCls = 'rc-picker',
    generateConfig,
    locale,
    format = 'YYYY-MM-DD',
    value,
    open,
    onChange,
    onOpenChange,
  } = props;

  // ============================= State =============================
  const formatList = toArray(format);

  // Real value
  const [innerValue, setInnerValue] = React.useState<DateType>(
    () => value || generateConfig.getNow(),
  );
  const mergedValue = value || innerValue;

  // Selected value
  const [selectedValue, setInternalSelectedValue] = React.useState<DateType>(
    mergedValue,
  );

  // Text
  const [textValue, setTextValue] = React.useState<string>(
    generateConfig.locale.format(locale.locale, selectedValue, formatList[0]),
  );
  const [typing, setTyping] = React.useState(false);

  /** Similar as `setTextValue` but accept `DateType` and convert into string */
  const setDateText = (date: DateType) => {
    setTextValue(
      generateConfig.locale.format(locale.locale, date, formatList[0]),
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
  const isSameTextDate = (text: string, date: DateType) => {
    const inputDate = generateConfig.locale.parse(
      locale.locale,
      text,
      formatList,
    );
    return isEqual(generateConfig, inputDate, date);
  };

  // =========================== Formatter ===========================
  const setSelectedValue = (newDate: DateType) => {
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
  };

  const triggerChange = (newValue: DateType) => {
    if (!isSameTextDate(textValue, newValue)) {
      setDateText(newValue);
    }

    if (onChange && !isEqual(generateConfig, mergedValue, newValue)) {
      onChange(newValue);
    }
  };

  const onInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    switch (e.which) {
      case KeyCode.ENTER: {
        if (!mergedOpen) {
          triggerOpen(true);
        } else {
          triggerChange(selectedValue);
          triggerOpen(false);
        }
        break;
      }

      case KeyCode.TAB: {
        if (typing && mergedOpen) {
          setTyping(false);
          e.preventDefault();
        } else if (!typing && mergedOpen && e.shiftKey) {
          setTyping(true);
          e.preventDefault();
        }
        break;
      }

      case KeyCode.ESC: {
        triggerChange(mergedValue);
        setSelectedValue(mergedValue);
        triggerOpen(false);
        return;
      }
    }

    // Let popup panel handle keyboard
    if (
      !typing &&
      mergedOpen &&
      operationRef.current &&
      operationRef.current.onKeyDown
    ) {
      operationRef.current.onKeyDown(e);
    }
  };

  const onInputFocus = () => {
    setTyping(true);
  };

  const onInputBlur = () => {
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
  const panel = (
    <PickerPanel<DateType>
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

  return (
    <PanelContext.Provider
      value={{
        operationRef,
      }}
    >
      <div>
        <PickerTrigger
          visible={mergedOpen}
          popupElement={panel}
          prefixCls={prefixCls}
        >
          <input
            readOnly={!typing}
            onMouseDown={onInputMouseDown}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            value={textValue}
            onChange={onInputChange}
            onKeyDown={onInputKeyDown}
          />
        </PickerTrigger>
      </div>
    </PanelContext.Provider>
  );
}

export default Picker;

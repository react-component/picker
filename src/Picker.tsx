import * as React from 'react';
import KeyCode from 'rc-util/lib/KeyCode';
import PickerPanel from './PickerPanel';
import PickerTrigger from './PickerTrigger';
import { GenerateConfig } from './utils/generateUtil';
import { Locale } from './interface';
import { isEqual } from './utils/dateUtil';
import { toArray } from './utils/miscUtil';

export interface PickerProps<DateType> {
  prefixCls?: string;
  generateConfig: GenerateConfig<DateType>;
  locale: Locale;
  value?: DateType;
  open?: boolean;
  format?: string | string[];
  onChange?: (value: DateType) => void;
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
  const triggerChange = (newValue: DateType) => {
    if (!isSameTextDate(textValue, newValue)) {
      setDateText(newValue);
    }

    if (onChange && !isEqual(generateConfig, mergedValue, newValue)) {
      onChange(newValue);
    }
  };

  const onInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (KeyCode.ENTER === e.which) {
      triggerChange(selectedValue);
      return;
    }

    // if ([KeyCode.UP, KeyCode.DOWN].includes(e.which)) {
    //   setTyping(false);
    //   e.preventDefault();
    //   return;
    // }

    if (!typing) {
      e.preventDefault();
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
  );
}

export default Picker;

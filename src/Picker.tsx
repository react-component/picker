import * as React from 'react';
import PickerPanel from './PickerPanel';
import PickerTrigger from './PickerTrigger';
import { GenerateConfig } from './utils/generateUtil';
import { Locale } from './interface';
import { isEqual } from './utils/dateUtil';

export interface PickerProps<DateType> {
  prefixCls?: string;
  generateConfig: GenerateConfig<DateType>;
  locale: Locale;
  value?: DateType;
  open?: boolean;
  onChange?: (value: DateType) => void;
}

function Picker<DateType>(props: PickerProps<DateType>) {
  const {
    prefixCls = 'rc-picker',
    generateConfig,
    locale,
    value,
    open,
    onChange,
  } = props;

  // Real value
  const [innerValue, setInnerValue] = React.useState<DateType>(
    () => value || generateConfig.getNow(),
  );
  const mergedValue = value || innerValue;

  // Selected value
  const [selectedValue, setSelectedValue] = React.useState<DateType>(
    mergedValue,
  );

  React.useEffect(() => {
    if (value && !isEqual(generateConfig, value, innerValue)) {
      setInnerValue(value);
      setSelectedValue(value);
    }
  }, [value]);

  // ============================ Trigger ============================
  const [innerOpen, setInnerOpen] = React.useState<boolean>(false);
  const mergedOpen = typeof open === 'boolean' ? open : innerOpen;

  const onInputMouseDown: React.MouseEventHandler<HTMLInputElement> = () => {
    setInnerOpen(true);
  };

  const onInputBlur = () => {
    setInnerOpen(false);
    setInnerValue(selectedValue);
    if (onChange) {
      onChange(selectedValue);
    }
  };

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
        <input onMouseDown={onInputMouseDown} onBlur={onInputBlur} />
      </PickerTrigger>
    </div>
  );
}

export default Picker;

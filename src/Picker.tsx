import * as React from 'react';
import PickerPanel from './PickerPanel';
import PickerTrigger from './PickerTrigger';
import { GenerateConfig } from './utils/generateUtil';
import { Locale } from './interface';

export interface PickerProps<DateType> {
  prefixCls?: string;
  generateConfig: GenerateConfig<DateType>;
  locale: Locale;
  value?: DateType;
}

function Picker<DateType>(props: PickerProps<DateType>) {
  const { prefixCls = 'rc-picker', generateConfig, locale, value } = props;

  // Real value
  const [innerValue, setInnerValue] = React.useState<DateType>(() =>
    generateConfig.getNow(),
  );
  const mergedValue = value || innerValue;

  // Selected value
  const [selectedValue, setSelectedValue] = React.useState<DateType>(
    mergedValue,
  );

  const panel = (
    <PickerPanel<DateType>
      generateConfig={generateConfig}
      value={selectedValue}
      locale={locale}
    />
  );

  return (
    <div>
      <PickerTrigger popupElement={panel} prefixCls={prefixCls}>
        <input />
      </PickerTrigger>
    </div>
  );
}

export default Picker;

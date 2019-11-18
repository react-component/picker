import * as React from 'react';
import DatePanel from './panels/DatePanel';
import { GenerateConfig } from './generate';
import { Locale } from './interface';

export interface PickerProps<DateType> {
  prefixCls?: string;
  generateConfig: GenerateConfig<DateType>;
  value: DateType;
  /** [Legacy] Set default display picker view date */
  defaultPickerValue?: DateType;
  locale: Locale;
  onSelect?: (value: DateType) => void;

  mode?: 'time' | 'date' | 'month' | 'year' | 'decade';
}

function Picker<DateType>(props: PickerProps<DateType>) {
  const {
    prefixCls = 'rc-picker',
    generateConfig,
    value,
    defaultPickerValue,
  } = props;
  const [viewDate, setViewDate] = React.useState(
    defaultPickerValue || value || generateConfig.getNow(),
  );

  return (
    <DatePanel
      {...props}
      prefixCls={prefixCls}
      viewDate={viewDate}
      onViewDateChange={setViewDate}
    />
  );
}

export default Picker;

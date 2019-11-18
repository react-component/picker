import * as React from 'react';
import DatePanel from './panels/DatePanel';
import MonthPanel from './panels/MonthPanel';
import YearPanel from './panels/YearPanel';
import DecadePanel from './panels/DecadePanel';
import { GenerateConfig } from './utils/generateUtil';
import { Locale, PanelMode } from './interface';

export interface PickerProps<DateType> {
  prefixCls?: string;
  generateConfig: GenerateConfig<DateType>;
  value: DateType;
  /** [Legacy] Set default display picker view date */
  defaultPickerValue?: DateType;
  locale: Locale;
  onSelect?: (value: DateType) => void;

  mode?: PanelMode;
}

function Picker<DateType>(props: PickerProps<DateType>) {
  const {
    prefixCls = 'rc-picker',
    generateConfig,
    value,
    defaultPickerValue,
    onSelect,
  } = props;

  const [viewDate, setViewDate] = React.useState(
    defaultPickerValue || value || generateConfig.getNow(),
  );

  const [mode, setMode] = React.useState<PanelMode>('date');

  const triggerSelect = (date: DateType) => {
    if (onSelect) {
      onSelect(date);
    }
  };

  React.useEffect(() => {
    if (value) {
      setViewDate(value);
    }
  }, [value]);

  const pickerProps = {
    ...props,
    prefixCls,
    viewDate,
    onViewDateChange: setViewDate,
    onPanelChange: setMode,
  };

  switch (mode) {
    case 'decade':
      return (
        <DecadePanel
          {...pickerProps}
          onSelect={date => {
            setMode('year');
            setViewDate(date);
          }}
        />
      );
    case 'year':
      return (
        <YearPanel
          {...pickerProps}
          onSelect={date => {
            setMode('month');
            setViewDate(date);
            triggerSelect(date);
          }}
        />
      );
    case 'month':
      return (
        <MonthPanel
          {...pickerProps}
          onSelect={date => {
            setMode('date');
            setViewDate(date);
            triggerSelect(date);
          }}
        />
      );
    default:
      return <DatePanel {...pickerProps} />;
  }
}

export default Picker;

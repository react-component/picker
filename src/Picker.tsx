import * as React from 'react';
import TimePanel from './panels/TimePanel';
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
  mode?: PanelMode;
  onSelect?: (value: DateType) => void;
  onPanelChange?: (value: DateType, mode: PanelMode) => void;
}

function Picker<DateType>(props: PickerProps<DateType>) {
  const {
    prefixCls = 'rc-picker',
    generateConfig,
    value,
    defaultPickerValue,
    onSelect,
    mode,
    onPanelChange,
  } = props;

  const [viewDate, setViewDate] = React.useState(
    defaultPickerValue || value || generateConfig.getNow(),
  );

  const [innerMode, setInnerMode] = React.useState<PanelMode>('date');
  const mergedMode = mode || innerMode;

  const onInternalPanelChange = (mode: PanelMode, viewValue: DateType) => {
    setInnerMode(mode);

    if (onPanelChange) {
      onPanelChange(viewValue, mode);
    }
  };

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
    onPanelChange: onInternalPanelChange,
  };

  switch (mergedMode) {
    case 'decade':
      return (
        <DecadePanel
          {...pickerProps}
          onSelect={date => {
            onInternalPanelChange('year', date);
            setViewDate(date);
          }}
        />
      );
    case 'year':
      return (
        <YearPanel
          {...pickerProps}
          onSelect={date => {
            onInternalPanelChange('month', date);
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
            onInternalPanelChange('date', date);
            setViewDate(date);
            triggerSelect(date);
          }}
        />
      );
    case 'time':
      return (
        <TimePanel
          {...pickerProps}
          onSelect={date => {
            onInternalPanelChange('date', date);
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

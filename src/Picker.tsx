import * as React from 'react';
import classNames from 'classnames';
import TimePanel, { SharedTimeProps } from './panels/TimePanel';
import DatePanel from './panels/DatePanel';
import MonthPanel from './panels/MonthPanel';
import YearPanel from './panels/YearPanel';
import DecadePanel from './panels/DecadePanel';
import { GenerateConfig } from './utils/generateUtil';
import { Locale, PanelMode } from './interface';

export interface PickerProps<DateType> {
  className?: string;
  style?: React.CSSProperties;
  prefixCls?: string;
  generateConfig: GenerateConfig<DateType>;
  value: DateType;
  /** [Legacy] Set default display picker view date */
  defaultPickerValue?: DateType;
  locale: Locale;
  mode?: PanelMode;
  showTime?: boolean | SharedTimeProps;
  onSelect?: (value: DateType) => void;
  onPanelChange?: (value: DateType, mode: PanelMode) => void;
}

function Picker<DateType>(props: PickerProps<DateType>) {
  const {
    prefixCls = 'rc-picker',
    className,
    style,
    generateConfig,
    value,
    defaultPickerValue,
    onSelect,
    mode,
    onPanelChange,
    showTime,
  } = props;

  const [viewDate, setViewDate] = React.useState(
    defaultPickerValue || value || generateConfig.getNow(),
  );

  const [innerMode, setInnerMode] = React.useState<PanelMode>('date');
  const mergedMode = mode || innerMode;

  const onInternalPanelChange = (newMode: PanelMode, viewValue: DateType) => {
    setInnerMode(newMode);

    if (onPanelChange) {
      onPanelChange(viewValue, newMode);
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
  delete pickerProps.onSelect;

  let panelNode: React.ReactNode;

  switch (mergedMode) {
    case 'decade':
      panelNode = (
        <DecadePanel<DateType>
          {...pickerProps}
          onSelect={date => {
            onInternalPanelChange('year', date);
            setViewDate(date);
          }}
        />
      );
      break;

    case 'year':
      panelNode = (
        <YearPanel<DateType>
          {...pickerProps}
          onSelect={date => {
            onInternalPanelChange('month', date);
            setViewDate(date);
            triggerSelect(date);
          }}
        />
      );
      break;

    case 'month':
      panelNode = (
        <MonthPanel<DateType>
          {...pickerProps}
          onSelect={date => {
            onInternalPanelChange('date', date);
            setViewDate(date);
            triggerSelect(date);
          }}
        />
      );
      break;

    case 'time':
      delete pickerProps.showTime;
      panelNode = (
        <TimePanel<DateType>
          {...pickerProps}
          {...(typeof showTime === 'object' ? showTime : null)}
          onSelect={date => {
            onInternalPanelChange('date', date);
            setViewDate(date);
            triggerSelect(date);
          }}
        />
      );
      break;

    default:
      panelNode = (
        <DatePanel<DateType>
          {...pickerProps}
          onSelect={date => {
            setViewDate(date);
            triggerSelect(date);
          }}
        />
      );
  }

  return (
    <div className={classNames(prefixCls, className)} style={style}>
      {panelNode}
    </div>
  );
}

export default Picker;

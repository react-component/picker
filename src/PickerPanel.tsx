import * as React from 'react';
import classNames from 'classnames';
import TimePanel, { SharedTimeProps } from './panels/TimePanel';
import DatePanel from './panels/DatePanel';
import MonthPanel from './panels/MonthPanel';
import YearPanel from './panels/YearPanel';
import DecadePanel from './panels/DecadePanel';
import { GenerateConfig } from './utils/generateUtil';
import { Locale, PanelMode, PanelRefProps } from './interface';

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

  const panelRef = React.useRef<PanelRefProps>({});

  // View date control
  const [viewDate, setViewDate] = React.useState(
    defaultPickerValue || value || generateConfig.getNow(),
  );

  // Panel control
  const getNextMode = (nextMode: PanelMode): PanelMode => {
    if (nextMode === 'date' && showTime) {
      return 'datetime';
    }
    return nextMode;
  };

  const [innerMode, setInnerMode] = React.useState<PanelMode>(
    getNextMode('date'),
  );
  const mergedMode: PanelMode = mode || innerMode;

  const onInternalPanelChange = (newMode: PanelMode, viewValue: DateType) => {
    const nextMode = getNextMode(newMode);
    setInnerMode(nextMode);

    if (onPanelChange) {
      onPanelChange(viewValue, nextMode);
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

  // =========================== Keyboard ===========================
  const onInternalKeyDown: React.KeyboardEventHandler<HTMLElement> = e => {
    if (panelRef.current && panelRef.current.onKeyDown) {
      e.preventDefault();
      panelRef.current.onKeyDown(e);
    }
  };

  // ============================ Panels ============================
  let panelNode: React.ReactNode;

  const pickerProps = {
    ...props,
    operationRef: panelRef,
    prefixCls,
    viewDate,
    onViewDateChange: setViewDate,
    onPanelChange: onInternalPanelChange,
  };
  delete pickerProps.onSelect;

  function renderDatePanel() {
    return (
      <DatePanel<DateType>
        {...pickerProps}
        onSelect={date => {
          setViewDate(date);
          triggerSelect(date);
        }}
      />
    );
  }

  function renderTimePanel() {
    return (
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
  }

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
            setViewDate(date);
            triggerSelect(date);
          }}
        />
      );
      break;

    case 'datetime':
      panelNode = (
        <div className={`${prefixCls}-datetime`}>
          {renderDatePanel()}
          {renderTimePanel()}
        </div>
      );
      break;

    case 'time':
      delete pickerProps.showTime;
      panelNode = renderTimePanel();
      break;

    default:
      panelNode = renderDatePanel();
  }

  return (
    <div
      tabIndex={-1}
      className={classNames(prefixCls, className)}
      style={style}
      onKeyDown={onInternalKeyDown}
    >
      {panelNode}
    </div>
  );
}

export default Picker;

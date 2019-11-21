/* eslint-disable jsx-a11y/no-noninteractive-tabindex */

import * as React from 'react';
import classNames from 'classnames';
import KeyCode from 'rc-util/lib/KeyCode';
import TimePanel, { SharedTimeProps } from './panels/TimePanel';
import DatetimePanel from './panels/DatetimePanel';
import DatePanel from './panels/DatePanel';
import MonthPanel from './panels/MonthPanel';
import YearPanel from './panels/YearPanel';
import DecadePanel from './panels/DecadePanel';
import { GenerateConfig } from './utils/generateUtil';
import { Locale, PanelMode, PanelRefProps } from './interface';
import { isEqual } from './utils/dateUtil';

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
  tabIndex?: number;
  onSelect?: (value: DateType) => void;
  onChange?: (value: DateType) => void;
  onPanelChange?: (value: DateType, mode: PanelMode) => void;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
}

function Picker<DateType>(props: PickerProps<DateType>) {
  const {
    prefixCls = 'rc-picker',
    className,
    style,
    generateConfig,
    value,
    defaultPickerValue,
    mode,
    tabIndex = 0,
    showTime,
    onSelect,
    onChange,
    onPanelChange,
    onMouseDown,
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

    if (onChange && !isEqual(generateConfig, date, value)) {
      onChange(date);
    }
  };

  React.useEffect(() => {
    if (value) {
      setViewDate(value);
    }
  }, [value]);

  // ========================= Interactive ==========================
  const onInternalKeyDown: React.KeyboardEventHandler<HTMLElement> = e => {
    if (panelRef.current && panelRef.current.onKeyDown) {
      if (
        [
          KeyCode.LEFT,
          KeyCode.RIGHT,
          KeyCode.UP,
          KeyCode.DOWN,
          KeyCode.PAGE_UP,
          KeyCode.PAGE_DOWN,
          KeyCode.ENTER,
        ].includes(e.which)
      ) {
        e.preventDefault();
      }
      panelRef.current.onKeyDown(e);
    }
  };

  const onInternalBlur: React.FocusEventHandler<HTMLElement> = e => {
    if (panelRef.current && panelRef.current.onBlur) {
      panelRef.current.onBlur(e);
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
        <DatetimePanel
          {...pickerProps}
          onSelect={date => {
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
    <div
      tabIndex={tabIndex}
      className={classNames(`${prefixCls}-panel`, className)}
      style={style}
      onKeyDown={onInternalKeyDown}
      onBlur={onInternalBlur}
      onMouseDown={onMouseDown}
    >
      {panelNode}
    </div>
  );
}

export default Picker;
/* eslint-enable */

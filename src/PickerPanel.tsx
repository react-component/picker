/* eslint-disable jsx-a11y/no-noninteractive-tabindex */

import * as React from 'react';
import classNames from 'classnames';
import KeyCode from 'rc-util/lib/KeyCode';
import TimePanel, { SharedTimeProps } from './panels/TimePanel';
import DatetimePanel from './panels/DatetimePanel';
import DatePanel from './panels/DatePanel';
import WeekPanel from './panels/WeekPanel';
import MonthPanel from './panels/MonthPanel';
import YearPanel from './panels/YearPanel';
import DecadePanel from './panels/DecadePanel';
import { GenerateConfig } from './generate';
import { Locale, PanelMode, PanelRefProps, GetNextMode } from './interface';
import { isEqual } from './utils/dateUtil';
import PanelContext from './PanelContext';
import { DateRender } from './panels/DatePanel/DateBody';

export interface PickerPanelProps<DateType> {
  className?: string;
  style?: React.CSSProperties;
  prefixCls?: string;
  generateConfig: GenerateConfig<DateType>;
  value?: DateType | null;
  /** [Legacy] Set default display picker view date */
  defaultPickerValue?: DateType;
  locale: Locale;
  mode?: PanelMode;
  showTime?: boolean | SharedTimeProps;
  tabIndex?: number;
  dateRender?: DateRender<DateType>;
  onSelect?: (value: DateType) => void;
  onChange?: (value: DateType) => void;
  onPanelChange?: (value: DateType, mode: PanelMode) => void;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;

  /** @private Internal usage, do not use in production mode!!! */
  getNextMode?: GetNextMode;
}

function PickerPanel<DateType>(props: PickerPanelProps<DateType>) {
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
    getNextMode,
    onSelect,
    onChange,
    onPanelChange,
    onMouseDown,
  } = props;

  const { operationRef } = React.useContext(PanelContext);
  const panelRef = React.useRef<PanelRefProps>({});

  // Handle init logic
  const initRef = React.useRef(true);

  // View date control
  const [viewDate, setViewDate] = React.useState(
    () => defaultPickerValue || value || generateConfig.getNow(),
  );

  // Inner value
  const [innerValue, setInnerValue] = React.useState(() =>
    ('value' in props ? value : generateConfig.getNow()),
  );

  const mergedValue = 'value' in props ? value : innerValue;

  // Panel control
  const getInternalNextMode = (
    nextMode: PanelMode,
    currentMode: PanelMode,
  ): PanelMode => {
    if (getNextMode) {
      return getNextMode(nextMode, currentMode);
    }

    if (nextMode === 'date' && showTime) {
      return 'datetime';
    }
    return nextMode;
  };

  const [innerMode, setInnerMode] = React.useState<PanelMode>(
    getInternalNextMode('date', mode || 'date'),
  );
  const mergedMode: PanelMode = mode || innerMode;

  const onInternalPanelChange = (newMode: PanelMode, viewValue: DateType) => {
    const nextMode = getInternalNextMode(newMode, mergedMode);
    setInnerMode(nextMode);

    if (onPanelChange) {
      onPanelChange(viewValue, nextMode);
    }
  };

  const triggerSelect = (date: DateType) => {
    setInnerValue(date);

    if (onSelect) {
      onSelect(date);
    }

    if (onChange && !isEqual(generateConfig, date, mergedValue)) {
      onChange(date);
    }
  };

  // ========================= Interactive ==========================
  const onInternalKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
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
      return panelRef.current.onKeyDown(e);
    }
    return false;
  };

  const onInternalBlur: React.FocusEventHandler<HTMLElement> = e => {
    if (panelRef.current && panelRef.current.onBlur) {
      panelRef.current.onBlur(e);
    }
  };

  if (operationRef) {
    operationRef.current = {
      onKeyDown: onInternalKeyDown,
      onClose: () => {
        if (panelRef.current && panelRef.current.onClose) {
          panelRef.current.onClose();
        }
      },
    };
  }

  // ============================ Effect ============================
  React.useEffect(() => {
    if (value && !initRef.current) {
      setViewDate(value);
    }
  }, [value]);

  React.useEffect(() => {
    initRef.current = false;
  }, []);

  // ============================ Panels ============================
  let panelNode: React.ReactNode;

  const pickerProps = {
    ...props,
    operationRef: panelRef,
    prefixCls,
    viewDate,
    value: mergedValue,
    onViewDateChange: setViewDate,
    onPanelChange: onInternalPanelChange,
  };
  delete pickerProps.getNextMode;
  delete pickerProps.onSelect;

  switch (mergedMode) {
    case 'decade':
      panelNode = (
        <DecadePanel<DateType>
          {...pickerProps}
          onSelect={date => {
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

    case 'week':
      panelNode = (
        <WeekPanel
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

export default PickerPanel;
/* eslint-enable */

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
import {
  Locale,
  PanelMode,
  PanelRefProps,
  PickerMode,
  DisabledTime,
} from './interface';
import { isEqual } from './utils/dateUtil';
import PanelContext from './PanelContext';
import { DateRender } from './panels/DatePanel/DateBody';
import { PickerModeMap } from './utils/uiUtil';
import { MonthCellRender } from './panels/MonthPanel/MonthBody';
import RangeContext from './RangeContext';

export interface PickerPanelProps<DateType> {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  mode?: PanelMode;
  picker?: PickerMode;
  tabIndex?: number;

  // Locale
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;

  // Value
  value?: DateType | null;
  defaultValue?: DateType;
  /** [Legacy] Set default display picker view date */
  defaultPickerValue?: DateType;

  // Time
  showTime?: boolean | SharedTimeProps<DateType>;
  disabledTime?: DisabledTime<DateType>;
  showToday?: boolean;
  disabledDate?: (date: DateType) => boolean;

  // Render
  dateRender?: DateRender<DateType>;
  monthCellRender?: MonthCellRender<DateType>;
  renderExtraFooter?: (mode: PanelMode) => React.ReactNode;

  // Event
  onSelect?: (value: DateType) => void;
  onChange?: (value: DateType) => void;
  onPanelChange?: (value: DateType, mode: PanelMode) => void;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
}

function PickerPanel<DateType>(props: PickerPanelProps<DateType>) {
  const {
    prefixCls = 'rc-picker',
    className,
    style,
    locale,
    generateConfig,
    value,
    defaultValue,
    defaultPickerValue,
    mode,
    picker,
    tabIndex = 0,
    showTime,
    showToday,
    renderExtraFooter,
    onSelect,
    onChange,
    onPanelChange,
    onMouseDown,
  } = props;

  const { operationRef } = React.useContext(PanelContext);
  const { extraFooterSelections } = React.useContext(RangeContext);
  const panelRef = React.useRef<PanelRefProps>({});

  // Handle init logic
  const initRef = React.useRef(true);

  // View date control
  const [viewDate, setViewDate] = React.useState(
    () => defaultPickerValue || value || generateConfig.getNow(),
  );

  // Inner value
  const [innerValue, setInnerValue] = React.useState(() => {
    if (value !== undefined) {
      return value;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    return null;
  });

  const mergedValue = 'value' in props ? value : innerValue;

  // Panel control
  const getInternalNextMode = (nextMode: PanelMode): PanelMode => {
    const getNextMode = PickerModeMap[picker!];
    if (getNextMode) {
      return getNextMode(nextMode);
    }

    if (nextMode === 'date' && showTime) {
      return 'datetime';
    }
    return nextMode;
  };

  const [innerMode, setInnerMode] = React.useState<PanelMode>(
    getInternalNextMode('date'),
  );
  const mergedMode: PanelMode = mode || innerMode;

  const onInternalPanelChange = (newMode: PanelMode, viewValue: DateType) => {
    const nextMode = getInternalNextMode(newMode);
    setInnerMode(nextMode);

    if (onPanelChange && mergedMode !== nextMode) {
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
  delete pickerProps.onChange;
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

  // ============================ Footer ============================
  let extraFooter: React.ReactNode;
  if (renderExtraFooter) {
    extraFooter = (
      <div className={`${prefixCls}-footer-extra`}>
        {renderExtraFooter(mergedMode)}
      </div>
    );
  }

  let todayNode: React.ReactNode;
  if (showToday) {
    todayNode = (
      <a
        className={`${prefixCls}-today-btn`}
        onClick={() => {
          triggerSelect(generateConfig.getNow());
        }}
      >
        {locale.today}
      </a>
    );
  }

  let extraSelectionNode: React.ReactNode;
  if (extraFooterSelections && extraFooterSelections.length) {
    extraSelectionNode = (
      <ul className={`${prefixCls}-ranges`}>
        {extraFooterSelections.map(({ label, onClick }) => (
          <li key={label} onClick={onClick}>
            {label}
          </li>
        ))}
      </ul>
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
      {extraFooter || todayNode || extraSelectionNode ? (
        <div className={`${prefixCls}-footer`}>
          {extraFooter}
          {extraSelectionNode}
          {todayNode}
        </div>
      ) : null}
    </div>
  );
}

export default PickerPanel;
/* eslint-enable */

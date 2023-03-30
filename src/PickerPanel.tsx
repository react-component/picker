/**
 * Logic:
 *  When `mode` === `picker`,
 *  click will trigger `onSelect` (if value changed trigger `onChange` also).
 *  Panel change will not trigger `onSelect` but trigger `onPanelChange`
 */

import classNames from 'classnames';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import KeyCode from 'rc-util/lib/KeyCode';
import warning from 'rc-util/lib/warning';
import * as React from 'react';
import type { GenerateConfig } from './generate';
import type {
  CellRender,
  CellRenderInfo,
  Components,
  DisabledTime,
  Locale,
  OnPanelChange,
  PanelMode,
  PanelRefProps,
  PickerMode,
} from './interface';
import PanelContext from './PanelContext';
import DatePanel from './panels/DatePanel';
import type { DateRender } from './panels/DatePanel/DateBody';
import DatetimePanel from './panels/DatetimePanel';
import DecadePanel from './panels/DecadePanel';
import MonthPanel from './panels/MonthPanel';
import type { MonthCellRender } from './panels/MonthPanel/MonthBody';
import QuarterPanel from './panels/QuarterPanel';
import type { SharedTimeProps } from './panels/TimePanel';
import TimePanel from './panels/TimePanel';
import WeekPanel from './panels/WeekPanel';
import YearPanel from './panels/YearPanel';
import RangeContext from './RangeContext';
import { isEqual } from './utils/dateUtil';
import getExtraFooter from './utils/getExtraFooter';
import getRanges from './utils/getRanges';
import { getLowerBoundTime, setDateTime, setTime } from './utils/timeUtil';
import { PickerModeMap } from './utils/uiUtil';

export type PickerPanelSharedProps<DateType> = {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  /** @deprecated Will be removed in next big version. Please use `picker` instead */
  mode?: PanelMode;
  tabIndex?: number;

  // Locale
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;

  // Value
  value?: DateType | null;
  defaultValue?: DateType;
  /** [Legacy] Set default display picker view date */
  pickerValue?: DateType;
  /** [Legacy] Set default display picker view date */
  defaultPickerValue?: DateType;

  // Date
  disabledDate?: (date: DateType) => boolean;

  // Render
  /** @deprecated use cellRender instead of dateRender */
  dateRender?: DateRender<DateType>;
  /** @deprecated use cellRender instead of monthCellRender */
  monthCellRender?: MonthCellRender<DateType>;
  renderExtraFooter?: (mode: PanelMode) => React.ReactNode;

  // Event
  onSelect?: (value: DateType) => void;
  onChange?: (value: DateType) => void;
  onPanelChange?: OnPanelChange<DateType>;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onOk?: (date: DateType) => void;

  direction?: 'ltr' | 'rtl';

  /** @private This is internal usage. Do not use in your production env */
  hideHeader?: boolean;
  /** @private This is internal usage. Do not use in your production env */
  onPickerValueChange?: (date: DateType) => void;

  /** @private Internal usage. Do not use in your production env */
  components?: Components;
  cellRender?: CellRender<DateType>;
};

export type PickerPanelBaseProps<DateType> = {
  picker: Exclude<PickerMode, 'date' | 'time'>;
  cellRender?: CellRender<DateType>;
} & PickerPanelSharedProps<DateType>;

export type PickerPanelDateProps<DateType> = {
  picker?: 'date';
  showToday?: boolean;
  showNow?: boolean;

  // Time
  showTime?: boolean | SharedTimeProps<DateType>;
  disabledTime?: DisabledTime<DateType>;
  cellRender?: CellRender<DateType>;
} & PickerPanelSharedProps<DateType>;

export type PickerPanelTimeProps<DateType> = {
  picker: 'time';
  cellRender?: CellRender<DateType, number>;
} & PickerPanelSharedProps<DateType> &
  SharedTimeProps<DateType>;

export type PickerPanelProps<DateType> =
  | PickerPanelBaseProps<DateType>
  | PickerPanelDateProps<DateType>
  | PickerPanelTimeProps<DateType>;

// TMP type to fit for ts 3.9.2
type OmitType<DateType> = Omit<PickerPanelBaseProps<DateType>, 'picker'> &
  Omit<PickerPanelDateProps<DateType>, 'picker'> &
  Omit<PickerPanelTimeProps<DateType>, 'picker'>;
type MergedPickerPanelProps<DateType> = {
  picker?: PickerMode;
} & OmitType<DateType>;

function PickerPanel<DateType>(props: PickerPanelProps<DateType>) {
  const {
    prefixCls = 'rc-picker',
    className,
    style,
    locale,
    generateConfig,
    value,
    defaultValue,
    pickerValue,
    defaultPickerValue,
    disabledDate,
    mode,
    picker = 'date',
    tabIndex = 0,
    showNow,
    showTime,
    showToday,
    renderExtraFooter,
    hideHeader,
    onSelect,
    onChange,
    onPanelChange,
    onMouseDown,
    onPickerValueChange,
    onOk,
    components,
    direction,
    hourStep = 1,
    minuteStep = 1,
    secondStep = 1,
    cellRender,
    dateRender,
    monthCellRender,
  } = props as MergedPickerPanelProps<DateType>;

  const needConfirmButton: boolean = (picker === 'date' && !!showTime) || picker === 'time';

  const isHourStepValid = 24 % hourStep === 0;
  const isMinuteStepValid = 60 % minuteStep === 0;
  const isSecondStepValid = 60 % secondStep === 0;

  if (process.env.NODE_ENV !== 'production') {
    warning(!value || generateConfig.isValidate(value), 'Invalidate date pass to `value`.');
    warning(!value || generateConfig.isValidate(value), 'Invalidate date pass to `defaultValue`.');
    warning(isHourStepValid, `\`hourStep\` ${hourStep} is invalid. It should be a factor of 24.`);
    warning(
      isMinuteStepValid,
      `\`minuteStep\` ${minuteStep} is invalid. It should be a factor of 60.`,
    );
    warning(
      isSecondStepValid,
      `\`secondStep\` ${secondStep} is invalid. It should be a factor of 60.`,
    );
    warning(!!dateRender, `'dateRender' is deprecated. Please use 'cellRender' instead.`);
    warning(!!monthCellRender, `'monthCellRender' is deprecated. Please use 'cellRender' instead.`);
  }

  // ============================ State =============================

  const panelContext = React.useContext(PanelContext);
  const { operationRef, onSelect: onContextSelect, hideRanges, defaultOpenValue } = panelContext;

  const { inRange, panelPosition, rangedValue, hoverRangedValue } = React.useContext(RangeContext);
  const panelRef = React.useRef<PanelRefProps>({});

  // Handle init logic
  const initRef = React.useRef(true);

  // Value
  const [mergedValue, setInnerValue] = useMergedState(null, {
    value,
    defaultValue,
    postState: (val) => {
      if (!val && defaultOpenValue && picker === 'time') {
        return defaultOpenValue;
      }
      return val;
    },
  });

  // View date control
  const [viewDate, setInnerViewDate] = useMergedState<DateType | null, DateType>(null, {
    value: pickerValue,
    defaultValue: defaultPickerValue || mergedValue,
    postState: (date) => {
      const now = generateConfig.getNow();
      if (!date) {
        return now;
      }
      // When value is null and set showTime
      if (!mergedValue && showTime) {
        const defaultDateObject =
          typeof showTime === 'object' ? showTime.defaultValue : defaultValue;
        return setDateTime(
          generateConfig,
          Array.isArray(date) ? date[0] : date,
          defaultDateObject || now,
        );
      }
      return Array.isArray(date) ? date[0] : date;
    },
  });

  const setViewDate = (date: DateType) => {
    setInnerViewDate(date);
    if (onPickerValueChange) {
      onPickerValueChange(date);
    }
  };

  // Panel control
  const getInternalNextMode = (nextMode: PanelMode): PanelMode => {
    const getNextMode = PickerModeMap[picker!];
    if (getNextMode) {
      return getNextMode(nextMode);
    }

    return nextMode;
  };

  // Save panel is changed from which panel
  const [mergedMode, setInnerMode] = useMergedState(
    () => {
      if (picker === 'time') {
        return 'time';
      }
      return getInternalNextMode('date');
    },
    {
      value: mode,
    },
  );

  React.useEffect(() => {
    setInnerMode(picker);
  }, [picker]);

  const [sourceMode, setSourceMode] = React.useState<PanelMode>(() => mergedMode);

  const onInternalPanelChange = (newMode: PanelMode | null, viewValue: DateType) => {
    const nextMode = getInternalNextMode(newMode || mergedMode);
    setSourceMode(mergedMode);
    setInnerMode(nextMode);

    if (onPanelChange && (mergedMode !== nextMode || isEqual(generateConfig, viewDate, viewDate))) {
      onPanelChange(viewValue, nextMode);
    }
  };

  const triggerSelect = (
    date: DateType,
    type: 'key' | 'mouse' | 'submit',
    forceTriggerSelect: boolean = false,
  ) => {
    if (mergedMode === picker || forceTriggerSelect) {
      setInnerValue(date);

      if (onSelect) {
        onSelect(date);
      }

      if (onContextSelect) {
        onContextSelect(date, type);
      }

      if (onChange && !isEqual(generateConfig, date, mergedValue) && !disabledDate?.(date)) {
        onChange(date);
      }
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

    /* istanbul ignore next */
    /* eslint-disable no-lone-blocks */
    {
      warning(
        false,
        'Panel not correct handle keyDown event. Please help to fire issue about this.',
      );
      return false;
    }
    /* eslint-enable no-lone-blocks */
  };

  const onInternalBlur: React.FocusEventHandler<HTMLElement> = (e) => {
    if (panelRef.current && panelRef.current.onBlur) {
      panelRef.current.onBlur(e);
    }
  };

  if (operationRef && panelPosition !== 'right') {
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
      setInnerViewDate(value);
    }
  }, [value]);

  React.useEffect(() => {
    initRef.current = false;
  }, []);

  // ============================ Panels ============================
  let panelNode: React.ReactNode;

  const pickerProps = {
    ...(props as MergedPickerPanelProps<DateType>),
    operationRef: panelRef,
    prefixCls,
    viewDate,
    value: mergedValue,
    onViewDateChange: setViewDate,
    sourceMode,
    onPanelChange: onInternalPanelChange,
    disabledDate,
  };
  delete pickerProps.onChange;
  delete pickerProps.onSelect;

  const mergedCellRender = React.useMemo(() => {
    if (cellRender) return cellRender;
    if (!monthCellRender && !dateRender) return undefined;
    return (current: DateType | number, info: CellRenderInfo<DateType>) => {
      const date = current as DateType;
      if (dateRender && info.type === "date") {
        return dateRender(date, info.today);
      }
      if (monthCellRender && info.type === "month") {
        return monthCellRender(date, info.locale);
      }
      return info.originNode;
    }
  }, [cellRender, monthCellRender, dateRender]);

  switch (mergedMode) {
    case 'decade':
      panelNode = (
        <DecadePanel<DateType>
          {...pickerProps}
          onSelect={(date, type) => {
            setViewDate(date);
            triggerSelect(date, type);
          }}
        />
      );
      break;

    case 'year':
      panelNode = (
        <YearPanel<DateType>
          {...pickerProps}
          cellRender={mergedCellRender}
          onSelect={(date, type) => {
            setViewDate(date);
            triggerSelect(date, type);
          }}
        />
      );
      break;

    case 'month':
      panelNode = (
        <MonthPanel<DateType>
          {...pickerProps}
          cellRender={mergedCellRender}
          onSelect={(date, type) => {
            setViewDate(date);
            triggerSelect(date, type);
          }}
        />
      );
      break;

    case 'quarter':
      panelNode = (
        <QuarterPanel<DateType>
          {...pickerProps}
          cellRender={mergedCellRender}
          onSelect={(date, type) => {
            setViewDate(date);
            triggerSelect(date, type);
          }}
        />
      );
      break;

    case 'week':
      panelNode = (
        <WeekPanel<DateType>
          {...pickerProps}
          cellRender={mergedCellRender}
          onSelect={(date, type) => {
            setViewDate(date);
            triggerSelect(date, type);
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
          cellRender={mergedCellRender}
          onSelect={(date, type) => {
            setViewDate(date);
            triggerSelect(date, type);
          }}
        />
      );
      break;

    default:
      if (showTime) {
        panelNode = (
          <DatetimePanel<DateType>
            {...pickerProps}
            cellRender={mergedCellRender}
            onSelect={(date, type) => {
              setViewDate(date);
              triggerSelect(date, type);
            }}
          />
        );
      } else {
        panelNode = (
          <DatePanel<DateType>
            {...pickerProps}
            cellRender={mergedCellRender}
            onSelect={(date, type) => {
              setViewDate(date);
              triggerSelect(date, type);
            }}
          />
        );
      }
  }

  // ============================ Footer ============================
  let extraFooter: React.ReactNode;
  let rangesNode: React.ReactNode;

  const onNow = () => {
    const now = generateConfig.getNow();
    const lowerBoundTime = getLowerBoundTime(
      generateConfig.getHour(now),
      generateConfig.getMinute(now),
      generateConfig.getSecond(now),
      isHourStepValid ? hourStep : 1,
      isMinuteStepValid ? minuteStep : 1,
      isSecondStepValid ? secondStep : 1,
    );
    const adjustedNow = setTime(
      generateConfig,
      now,
      lowerBoundTime[0], // hour
      lowerBoundTime[1], // minute
      lowerBoundTime[2], // second
    );
    triggerSelect(adjustedNow, 'submit');
  };

  if (!hideRanges) {
    extraFooter = getExtraFooter(prefixCls, mergedMode, renderExtraFooter);
    rangesNode = getRanges({
      prefixCls,
      components,
      needConfirmButton,
      okDisabled: !mergedValue || (disabledDate && disabledDate(mergedValue)),
      locale,
      showNow,
      onNow: needConfirmButton && onNow,
      onOk: () => {
        if (mergedValue) {
          triggerSelect(mergedValue, 'submit', true);
          if (onOk) {
            onOk(mergedValue);
          }
        }
      },
    });
  }

  let todayNode: React.ReactNode;

  if (showToday && mergedMode === 'date' && picker === 'date' && !showTime) {
    const now = generateConfig.getNow();
    const todayCls = `${prefixCls}-today-btn`;
    const disabled = disabledDate && disabledDate(now);
    todayNode = (
      <a
        className={classNames(todayCls, disabled && `${todayCls}-disabled`)}
        aria-disabled={disabled}
        onClick={() => {
          if (!disabled) {
            triggerSelect(now, 'mouse', true);
          }
        }}
      >
        {locale.today}
      </a>
    );
  }

  return (
    <PanelContext.Provider
      value={{
        ...panelContext,
        mode: mergedMode,
        hideHeader: 'hideHeader' in props ? hideHeader : panelContext.hideHeader,
        hidePrevBtn: inRange && panelPosition === 'right',
        hideNextBtn: inRange && panelPosition === 'left',
      }}
    >
      <div
        tabIndex={tabIndex}
        className={classNames(`${prefixCls}-panel`, className, {
          [`${prefixCls}-panel-has-range`]: rangedValue && rangedValue[0] && rangedValue[1],
          [`${prefixCls}-panel-has-range-hover`]:
            hoverRangedValue && hoverRangedValue[0] && hoverRangedValue[1],
          [`${prefixCls}-panel-rtl`]: direction === 'rtl',
        })}
        style={style}
        onKeyDown={onInternalKeyDown}
        onBlur={onInternalBlur}
        onMouseDown={onMouseDown}
      >
        {panelNode}
        {extraFooter || rangesNode || todayNode ? (
          <div className={`${prefixCls}-footer`}>
            {extraFooter}
            {rangesNode}
            {todayNode}
          </div>
        ) : null}
      </div>
    </PanelContext.Provider>
  );
}

export default PickerPanel;
/* eslint-enable */

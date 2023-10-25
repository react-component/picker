import * as React from 'react';
import { formatValue } from '../../../../utils/dateUtil';
import { leftPad } from '../../../../utils/miscUtil';
import type { SharedPanelProps, SharedTimeProps } from '../../../interface';
import { PanelContext } from '../../context';
import TimeColumn, { type Unit } from './TimeColumn';
import { findValidateTime } from './util';

function emptyDisabled<T>(): T[] {
  return [];
}

function isAM(hour: number) {
  return hour < 12;
}

function checkShow(format: string, keywords: string[], propShow?: boolean) {
  return propShow ?? keywords.some((keyword) => format.includes(keyword));
}

function generateUnits(
  start: number,
  end: number,
  step = 1,
  hideDisabledOptions = false,
  disabledUnits: number[] = [],
  pad = 2,
) {
  const units: Unit<number>[] = [];
  const integerStep = step >= 1 ? step | 0 : 1;
  for (let i = start; i <= end; i += integerStep) {
    const disabled = disabledUnits.includes(i);

    if (!disabled || !hideDisabledOptions) {
      units.push({
        label: leftPad(i, pad),
        value: i,
        disabled,
      });
    }
  }
  return units;
}

export type TimePanelBodyProps<DateType = any> = SharedPanelProps<DateType>;

export default function TimePanelBody<DateType = any>(props: SharedTimeProps<DateType>) {
  const {
    format,

    // Show
    showHour,
    showMinute,
    showSecond,
    showMillisecond,
    use12Hours,
    showTitle,

    // Steps
    hourStep,
    minuteStep,
    secondStep,
    millisecondStep = 100,

    // Disabled
    hideDisabledOptions,
    disabledTime,
    disabledHours,
    disabledMinutes,
    disabledSeconds,

    // MISC
    changeOnScroll,
  } = props;

  const { prefixCls, value, generateConfig, locale, onChange } = React.useContext(PanelContext);

  // ========================= Value ==========================
  const hour = generateConfig.getHour(value);
  const minute = generateConfig.getMinute(value);
  const second = generateConfig.getSecond(value);
  const millisecond = generateConfig.getMillisecond(value);
  const meridiem = isAM(hour) ? 'am' : 'pm';

  // ========================== Show ==========================
  const mergedShowHour = checkShow(format, ['H', 'LT', 'LLL'], showHour);
  const mergedShowMinute = checkShow(format, ['m', 'LT', 'LLL'], showMinute);
  const mergedShowSecond = checkShow(format, ['s', 'LTS'], showSecond);
  const mergedShowMillisecond = checkShow(format, ['SSS'], showMillisecond);
  const mergedShowMeridiem = checkShow(format, ['a', 'A', 'LT', 'LLL'], use12Hours);

  // ======================== Disabled ========================
  const [
    mergedDisabledHours,
    mergedDisabledMinutes,
    mergedDisabledSeconds,
    mergedDisabledMilliseconds,
  ] = React.useMemo(() => {
    const disabledConfig = disabledTime?.(value) || {};

    return [
      disabledConfig.disabledHours || disabledHours || emptyDisabled,
      disabledConfig.disabledMinutes || disabledMinutes || emptyDisabled,
      disabledConfig.disabledSeconds || disabledSeconds || emptyDisabled,
      disabledConfig.disabledMilliSeconds || emptyDisabled,
    ];
  }, [value, disabledTime, disabledHours, disabledMinutes, disabledSeconds]);

  // ========================= Column =========================
  const rowHourUnits = React.useMemo(() => {
    const hours = generateUnits(0, 23, hourStep, hideDisabledOptions, mergedDisabledHours());

    return mergedShowMeridiem
      ? hours.map((unit) => ({
          ...unit,
          label: leftPad((unit.value as number) % 12 || 12, 2),
        }))
      : hours;
  }, [hideDisabledOptions, hourStep, mergedDisabledHours, mergedShowMeridiem]);

  const hourUnits = React.useMemo(() => {
    if (!mergedShowMeridiem) {
      return rowHourUnits;
    }

    return isAM(hour)
      ? rowHourUnits.filter((h) => isAM(h.value as number))
      : rowHourUnits.filter((h) => !isAM(h.value as number));
  }, [hour, rowHourUnits, mergedShowMeridiem]);

  const getMinuteUnits = React.useCallback(
    (nextHour: number) =>
      generateUnits(0, 59, minuteStep, hideDisabledOptions, mergedDisabledMinutes(nextHour)),
    [hideDisabledOptions, mergedDisabledMinutes, minuteStep],
  );

  const getSecondUnits = React.useCallback(
    (nextHour: number, nextMinute: number) =>
      generateUnits(
        0,
        59,
        secondStep,
        hideDisabledOptions,
        mergedDisabledSeconds(nextHour, nextMinute),
      ),
    [hideDisabledOptions, mergedDisabledSeconds, secondStep],
  );

  const getMillisecondUnits = React.useCallback(
    (nextHour: number, nextMinute: number, nextSecond: number) =>
      generateUnits(
        0,
        999,
        millisecondStep,
        hideDisabledOptions,
        mergedDisabledMilliseconds(nextHour, nextMinute, nextSecond),
        3,
      ),
    [hideDisabledOptions, mergedDisabledMilliseconds, millisecondStep],
  );

  const minuteUnits = React.useMemo(() => getMinuteUnits(hour), [getMinuteUnits, hour]);

  const secondUnits = React.useMemo(
    () => getSecondUnits(hour, minute),
    [getSecondUnits, hour, minute],
  );

  const millisecondUnits = React.useMemo(
    () => getMillisecondUnits(hour, minute, second),
    [getMillisecondUnits, hour, minute, second],
  );

  const meridiemUnits = React.useMemo(() => {
    if (!mergedShowMeridiem) {
      return [];
    }

    const base = generateConfig.getNow();
    const amDate = generateConfig.setHour(base, 6);
    const pmDate = generateConfig.setHour(base, 18);

    return [
      {
        label: locale.meridiemFormat
          ? formatValue(amDate, {
              generateConfig,
              locale,
              format: locale.meridiemFormat,
            })
          : 'AM',
        value: 'am',
        disabled: rowHourUnits.every((h) => !isAM(h.value as number)),
      },
      {
        label: locale.meridiemFormat
          ? formatValue(pmDate, {
              generateConfig,
              locale,
              format: locale.meridiemFormat,
            })
          : 'PM',
        value: 'pm',
        disabled: rowHourUnits.every((h) => isAM(h.value as number)),
      },
    ];
  }, [rowHourUnits, mergedShowMeridiem, generateConfig, locale]);

  // ========================= Change =========================
  /**
   * Check if time is validate or will match to validate one
   */
  const triggerChange = (nextDate: DateType) => {
    const validateDate = findValidateTime(
      nextDate,
      () => rowHourUnits,
      getMinuteUnits,
      getSecondUnits,
      generateConfig,
    );

    onChange(validateDate);
  };

  // ========================= Column =========================
  const onHourChange = (val: number) => {
    triggerChange(generateConfig.setHour(value, val));
  };

  const onMinuteChange = (val: number) => {
    triggerChange(generateConfig.setMinute(value, val));
  };

  const onSecondChange = (val: number) => {
    triggerChange(generateConfig.setSecond(value, val));
  };

  const onMillisecondChange = (val: number) => {
    triggerChange(generateConfig.setMillisecond(value, val));
  };

  const onMeridiemChange = (val: string) => {
    if (val === 'am' && !isAM(hour)) {
      triggerChange(generateConfig.setHour(value, hour - 12));
    } else if (val === 'pm' && isAM(hour)) {
      triggerChange(generateConfig.setHour(value, hour + 12));
    }
  };

  // ========================= Render =========================
  return (
    <div className={`${prefixCls}-content`}>
      {mergedShowHour && (
        <TimeColumn
          showTitle={showTitle}
          title={locale.hour}
          units={hourUnits}
          value={hour}
          type="hour"
          onChange={onHourChange}
          changeOnScroll={changeOnScroll}
        />
      )}
      {mergedShowMinute && (
        <TimeColumn
          showTitle={showTitle}
          title={locale.minute}
          units={minuteUnits}
          value={minute}
          type="minute"
          onChange={onMinuteChange}
          changeOnScroll={changeOnScroll}
        />
      )}
      {mergedShowSecond && (
        <TimeColumn
          showTitle={showTitle}
          title={locale.second}
          units={secondUnits}
          value={second}
          type="second"
          onChange={onSecondChange}
          changeOnScroll={changeOnScroll}
        />
      )}
      {mergedShowMillisecond && (
        <TimeColumn
          showTitle={showTitle}
          title={locale.millisecond}
          units={millisecondUnits}
          value={millisecond}
          type="millisecond"
          onChange={onMillisecondChange}
          changeOnScroll={changeOnScroll}
        />
      )}
      {mergedShowMeridiem && (
        <TimeColumn
          showTitle={showTitle}
          title={locale.meridiem}
          units={meridiemUnits}
          value={meridiem}
          type="meridiem"
          onChange={onMeridiemChange}
          changeOnScroll={changeOnScroll}
        />
      )}
    </div>
  );
}

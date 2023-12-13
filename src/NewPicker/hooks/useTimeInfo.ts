import * as React from 'react';
import type { GenerateConfig } from '../../generate';
import { leftPad } from '../../utils/miscUtil';
import type { SharedTimeProps } from '../interface';
import { findValidateTime } from '../PickerPanel/TimePanel/TimePanelBody/util';

export type Unit<ValueType = number | string> = {
  label: React.ReactText;
  value: ValueType;
  disabled?: boolean;
};

function emptyDisabled<T>(): T[] {
  return [];
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

/**
 * Parse time props to get util info
 */
export default function useTimeInfo<DateType extends object = any>(
  date: DateType,
  generateConfig: GenerateConfig<DateType>,
  props: SharedTimeProps<DateType> = {},
) {
  const {
    // Fallback if `showTime` is empty
    format = '',

    // Show
    showHour,
    showMinute,
    showSecond,
    showMillisecond,
    use12Hours,

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
  } = props || {};

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
    const disabledConfig = disabledTime?.(date) || {};

    return [
      disabledConfig.disabledHours || disabledHours || emptyDisabled,
      disabledConfig.disabledMinutes || disabledMinutes || emptyDisabled,
      disabledConfig.disabledSeconds || disabledSeconds || emptyDisabled,
      disabledConfig.disabledMilliSeconds || emptyDisabled,
    ];
  }, [date, disabledTime, disabledHours, disabledMinutes, disabledSeconds]);

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

  // Minutes
  const getMinuteUnits = React.useCallback(
    (nextHour: number) =>
      generateUnits(0, 59, minuteStep, hideDisabledOptions, mergedDisabledMinutes(nextHour)),
    [hideDisabledOptions, mergedDisabledMinutes, minuteStep],
  );

  // Seconds
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

  // Milliseconds
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

  const getValidTime = (nextDate: DateType) => {
    const validateDate = findValidateTime(
      nextDate,
      () => rowHourUnits,
      getMinuteUnits,
      getSecondUnits,
      getMillisecondUnits,
      generateConfig,
    );

    return validateDate;
  };

  return [
    // getValidTime
    getValidTime,

    // Show columns
    mergedShowHour,
    mergedShowMinute,
    mergedShowSecond,
    mergedShowMillisecond,
    mergedShowMeridiem,

    // Units
    rowHourUnits,
    getMinuteUnits,
    getSecondUnits,
    getMillisecondUnits,
  ] as const;
}

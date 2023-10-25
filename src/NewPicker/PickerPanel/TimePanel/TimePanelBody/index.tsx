import * as React from 'react';
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
) {
  const units: Unit<number>[] = [];
  const integerStep = step >= 1 ? step | 0 : 1;
  for (let i = start; i <= end; i += integerStep) {
    const disabled = disabledUnits.includes(i);

    if (!disabled || !hideDisabledOptions) {
      units.push({
        label: leftPad(i, 2),
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
    use12Hours,

    // Steps
    hourStep,
    minuteStep,
    secondStep,

    // Disabled
    hideDisabledOptions,
    disabledTime,
    disabledHours,
    disabledMinutes,
    disabledSeconds,

    // MISC
    changeOnScroll,
  } = props;

  const { prefixCls, value, pickerValue, generateConfig, onChange } =
    React.useContext(PanelContext);

  // ========================= Value ==========================
  const mergedValue = value || pickerValue;

  const hour = generateConfig.getHour(mergedValue);
  const minute = generateConfig.getMinute(mergedValue);
  const second = generateConfig.getSecond(mergedValue);
  const meridiem = isAM(hour) ? 'am' : 'pm';

  // ========================== Show ==========================
  const mergedShowHour = checkShow(format, ['H', 'LT', 'LLL'], showHour);
  const mergedShowMinute = checkShow(format, ['m', 'LT', 'LLL'], showMinute);
  const mergedShowSecond = checkShow(format, ['s', 'LTS'], showSecond);
  const mergedShowMeridiem = checkShow(format, ['a', 'A', 'LT', 'LLL'], use12Hours);

  // ======================== Disabled ========================
  const [mergedDisabledHours, mergedDisabledMinutes, mergedDisabledSeconds] = React.useMemo(() => {
    const disabledConfig = disabledTime?.(mergedValue) || {};

    return [
      disabledConfig.disabledHours || disabledHours || emptyDisabled,
      disabledConfig.disabledMinutes || disabledMinutes || emptyDisabled,
      disabledConfig.disabledSeconds || disabledSeconds || emptyDisabled,
    ];
  }, [mergedValue, disabledTime, disabledHours, disabledMinutes, disabledSeconds]);

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

  const minuteUnits = React.useMemo(() => getMinuteUnits(hour), [getMinuteUnits, hour]);

  const secondUnits = React.useMemo(
    () => getSecondUnits(hour, minute),
    [getSecondUnits, hour, minute],
  );

  const meridiemUnits = React.useMemo(
    () => [
      {
        label: 'AM',
        value: 'am',
        disabled: rowHourUnits.every((h) => !isAM(h.value as number)),
      },
      {
        label: 'PM',
        value: 'pm',
        disabled: rowHourUnits.every((h) => isAM(h.value as number)),
      },
    ],
    [rowHourUnits],
  );

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

    console.log('~~~>', validateDate.format('HH:mm:ss'));

    onChange(validateDate);
  };

  // ========================= Column =========================
  const onHourChange = (val: number) => {
    triggerChange(generateConfig.setHour(mergedValue, val));
  };

  const onMinuteChange = (val: number) => {
    triggerChange(generateConfig.setMinute(mergedValue, val));
  };

  const onSecondChange = (val: number) => {
    triggerChange(generateConfig.setSecond(mergedValue, val));
  };

  const onMeridiemChange = (val: string) => {
    if (val === 'am' && !isAM(hour)) {
      triggerChange(generateConfig.setHour(mergedValue, hour - 12));
    } else if (val === 'pm' && isAM(hour)) {
      triggerChange(generateConfig.setHour(mergedValue, hour + 12));
    }
  };

  // ========================= Render =========================
  return (
    <div className={`${prefixCls}-content`}>
      {mergedShowHour && (
        <TimeColumn
          units={hourUnits}
          value={hour}
          type="hour"
          onChange={onHourChange}
          changeOnScroll={changeOnScroll}
        />
      )}
      {mergedShowMinute && (
        <TimeColumn
          units={minuteUnits}
          value={minute}
          type="minute"
          onChange={onMinuteChange}
          changeOnScroll={changeOnScroll}
        />
      )}
      {mergedShowSecond && (
        <TimeColumn
          units={secondUnits}
          value={second}
          type="second"
          onChange={onSecondChange}
          changeOnScroll={changeOnScroll}
        />
      )}
      {mergedShowMeridiem && (
        <TimeColumn
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

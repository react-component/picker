import * as React from 'react';
import { formatValue } from '../../../../utils/dateUtil';
import { leftPad } from '../../../../utils/miscUtil';
import useTimeInfo from '../../../hooks/useTimeInfo';
import type { SharedPanelProps, SharedTimeProps } from '../../../interface';
import { PickerHackContext, usePanelContext } from '../../context';
import TimeColumn, { type Unit } from './TimeColumn';

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

export type TimePanelBodyProps<DateType extends object = any> = SharedPanelProps<DateType>;

export default function TimePanelBody<DateType extends object = any>(
  props: SharedTimeProps<DateType>,
) {
  const {
    format,

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

    // MISC
    changeOnScroll,
  } = props;

  const { prefixCls, values, generateConfig, locale, onSelect, pickerValue } =
    usePanelContext<DateType>();

  const value = values?.[0] || null;

  const { onCellDblClick } = React.useContext(PickerHackContext);

  // ========================== Info ==========================
  const [
    mergedShowHour,
    mergedShowMinute,
    mergedShowSecond,
    mergedShowMillisecond,
    mergedShowMeridiem,

    rowHourUnits,
    getMinuteUnits,
    getSecondUnits,
    getMillisecondUnits,

    getValidTime,
  ] = useTimeInfo(value, generateConfig, props);

  // ========================= Value ==========================
  // PickerValue will tell which one to align on the top
  const getUnitValue = (
    func: 'getHour' | 'getMinute' | 'getSecond' | 'getMillisecond',
  ): [valueNum: number, pickerNum: number] => {
    const valueUnitVal = value && generateConfig[func](value);
    const pickerUnitValue = pickerValue && generateConfig[func](pickerValue);

    return [valueUnitVal, pickerUnitValue];
  };

  const [hour, pickerHour] = getUnitValue('getHour');
  const [minute, pickerMinute] = getUnitValue('getMinute');
  const [second, pickerSecond] = getUnitValue('getSecond');
  const [millisecond, pickerMillisecond] = getUnitValue('getMillisecond');
  const meridiem = hour === null ? null : isAM(hour) ? 'am' : 'pm';

  // // ======================== Disabled ========================
  // const [
  //   mergedDisabledHours,
  //   mergedDisabledMinutes,
  //   mergedDisabledSeconds,
  //   mergedDisabledMilliseconds,
  // ] = React.useMemo(() => {
  //   const disabledConfig = disabledTime?.(value) || {};

  //   return [
  //     disabledConfig.disabledHours || disabledHours || emptyDisabled,
  //     disabledConfig.disabledMinutes || disabledMinutes || emptyDisabled,
  //     disabledConfig.disabledSeconds || disabledSeconds || emptyDisabled,
  //     disabledConfig.disabledMilliSeconds || emptyDisabled,
  //   ];
  // }, [value, disabledTime, disabledHours, disabledMinutes, disabledSeconds]);

  // ========================= Column =========================
  // Hours
  // const rowHourUnits = React.useMemo(() => {
  //   const hours = generateUnits(0, 23, hourStep, hideDisabledOptions, mergedDisabledHours());

  //   return mergedShowMeridiem
  //     ? hours.map((unit) => ({
  //         ...unit,
  //         label: leftPad((unit.value as number) % 12 || 12, 2),
  //       }))
  //     : hours;
  // }, [hideDisabledOptions, hourStep, mergedDisabledHours, mergedShowMeridiem]);

  const hourUnits = React.useMemo(() => {
    if (!mergedShowMeridiem) {
      return rowHourUnits;
    }

    return isAM(hour)
      ? rowHourUnits.filter((h) => isAM(h.value as number))
      : rowHourUnits.filter((h) => !isAM(h.value as number));
  }, [hour, rowHourUnits, mergedShowMeridiem]);

  // Minutes
  // const getMinuteUnits = React.useCallback(
  //   (nextHour: number) =>
  //     generateUnits(0, 59, minuteStep, hideDisabledOptions, mergedDisabledMinutes(nextHour)),
  //   [hideDisabledOptions, mergedDisabledMinutes, minuteStep],
  // );

  // Seconds
  // const getSecondUnits = React.useCallback(
  //   (nextHour: number, nextMinute: number) =>
  //     generateUnits(
  //       0,
  //       59,
  //       secondStep,
  //       hideDisabledOptions,
  //       mergedDisabledSeconds(nextHour, nextMinute),
  //     ),
  //   [hideDisabledOptions, mergedDisabledSeconds, secondStep],
  // );

  // Milliseconds
  // const getMillisecondUnits = React.useCallback(
  //   (nextHour: number, nextMinute: number, nextSecond: number) =>
  //     generateUnits(
  //       0,
  //       999,
  //       millisecondStep,
  //       hideDisabledOptions,
  //       mergedDisabledMilliseconds(nextHour, nextMinute, nextSecond),
  //       3,
  //     ),
  //   [hideDisabledOptions, mergedDisabledMilliseconds, millisecondStep],
  // );

  // >>> Pick Fallback
  const getEnabled = (units: Unit<number>[], val: number) => {
    const enabledUnits = units.filter((unit) => !unit.disabled);

    return (
      val ??
      // Fallback to enabled value
      enabledUnits?.[0]?.value
    );
  };

  // >>> Minutes
  const validHour = getEnabled(rowHourUnits, hour);
  const minuteUnits = React.useMemo(() => getMinuteUnits(validHour), [getMinuteUnits, validHour]);

  // >>> Seconds
  const validMinute = getEnabled(minuteUnits, minute);
  const secondUnits = React.useMemo(
    () => getSecondUnits(validHour, validMinute),
    [getSecondUnits, validHour, validMinute],
  );

  // >>> Milliseconds
  const validSecond = getEnabled(secondUnits, second);
  const millisecondUnits = React.useMemo(
    () => getMillisecondUnits(validHour, validMinute, validSecond),
    [getMillisecondUnits, validHour, validMinute, validSecond],
  );

  const validMillisecond = getEnabled(millisecondUnits, millisecond);

  // Meridiem
  const meridiemUnits = React.useMemo(() => {
    if (!mergedShowMeridiem) {
      return [];
    }

    const base = generateConfig.getNow();
    const amDate = generateConfig.setHour(base, 6);
    const pmDate = generateConfig.setHour(base, 18);

    const formatMeridiem = (date: DateType, defaultLabel: string) => {
      const { cellMeridiemFormat } = locale;
      return cellMeridiemFormat
        ? formatValue(date, {
            generateConfig,
            locale,
            format: cellMeridiemFormat,
          })
        : defaultLabel;
    };

    return [
      {
        label: formatMeridiem(amDate, 'AM'),
        value: 'am',
        disabled: rowHourUnits.every((h) => h.disabled || !isAM(h.value as number)),
      },
      {
        label: formatMeridiem(pmDate, 'PM'),
        value: 'pm',
        disabled: rowHourUnits.every((h) => h.disabled || isAM(h.value as number)),
      },
    ];
  }, [rowHourUnits, mergedShowMeridiem, generateConfig, locale]);

  // ========================= Change =========================
  /**
   * Check if time is validate or will match to validate one
   */
  const triggerChange = (nextDate: DateType) => {
    const validateDate = getValidTime(nextDate);

    onSelect(validateDate);
  };

  // ========================= Column =========================
  // Create a template date for the trigger change event
  const triggerDateTmpl = React.useMemo(() => {
    let tmpl = pickerValue || generateConfig.getNow();

    const isNotNull = (num: number) => num !== null && num !== undefined;

    if (isNotNull(hour)) {
      tmpl = generateConfig.setHour(tmpl, hour);
      tmpl = generateConfig.setMinute(tmpl, minute);
      tmpl = generateConfig.setSecond(tmpl, second);
      tmpl = generateConfig.setMillisecond(tmpl, millisecond);
    } else if (isNotNull(pickerHour)) {
      tmpl = generateConfig.setHour(tmpl, pickerHour);
      tmpl = generateConfig.setMinute(tmpl, pickerMinute);
      tmpl = generateConfig.setSecond(tmpl, pickerSecond);
      tmpl = generateConfig.setMillisecond(tmpl, pickerMillisecond);
    } else if (isNotNull(validHour)) {
      tmpl = generateConfig.setHour(tmpl, validHour);
      tmpl = generateConfig.setMinute(tmpl, validMinute);
      tmpl = generateConfig.setSecond(tmpl, validSecond);
      tmpl = generateConfig.setMillisecond(tmpl, validMillisecond);
    }

    return tmpl;
  }, [
    pickerValue,
    hour,
    minute,
    second,
    millisecond,
    validHour,
    validMinute,
    validSecond,
    validMillisecond,
    pickerHour,
    pickerMinute,
    pickerSecond,
    pickerMillisecond,
    generateConfig,
  ]);

  const onHourChange = (val: number) => {
    triggerChange(generateConfig.setHour(triggerDateTmpl, val));
  };

  const onMinuteChange = (val: number) => {
    triggerChange(generateConfig.setMinute(triggerDateTmpl, val));
  };

  const onSecondChange = (val: number) => {
    triggerChange(generateConfig.setSecond(triggerDateTmpl, val));
  };

  const onMillisecondChange = (val: number) => {
    triggerChange(generateConfig.setMillisecond(triggerDateTmpl, val));
  };

  const onMeridiemChange = (val: string) => {
    if (val === 'am' && !isAM(hour)) {
      triggerChange(generateConfig.setHour(triggerDateTmpl, hour - 12));
    } else if (val === 'pm' && isAM(hour)) {
      triggerChange(generateConfig.setHour(triggerDateTmpl, hour + 12));
    }
  };

  // ========================= Render =========================
  const sharedColumnProps = {
    onDblClick: onCellDblClick,
    changeOnScroll,
  };

  return (
    <div className={`${prefixCls}-content`}>
      {mergedShowHour && (
        <TimeColumn
          units={hourUnits}
          value={hour}
          optionalValue={pickerHour}
          type="hour"
          onChange={onHourChange}
          {...sharedColumnProps}
        />
      )}
      {mergedShowMinute && (
        <TimeColumn
          units={minuteUnits}
          value={minute}
          optionalValue={pickerMinute}
          type="minute"
          onChange={onMinuteChange}
          {...sharedColumnProps}
        />
      )}
      {mergedShowSecond && (
        <TimeColumn
          units={secondUnits}
          value={second}
          optionalValue={pickerSecond}
          type="second"
          onChange={onSecondChange}
          {...sharedColumnProps}
        />
      )}
      {mergedShowMillisecond && (
        <TimeColumn
          units={millisecondUnits}
          value={millisecond}
          optionalValue={pickerMillisecond}
          type="millisecond"
          onChange={onMillisecondChange}
          {...sharedColumnProps}
        />
      )}
      {mergedShowMeridiem && (
        <TimeColumn
          units={meridiemUnits}
          value={meridiem}
          type="meridiem"
          onChange={onMeridiemChange}
          {...sharedColumnProps}
        />
      )}
    </div>
  );
}

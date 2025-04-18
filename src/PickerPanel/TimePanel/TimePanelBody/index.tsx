import * as React from 'react';
import useTimeInfo from '../../../hooks/useTimeInfo';
import type { SharedPanelProps, SharedTimeProps } from '../../../interface';
import { formatValue } from '../../../utils/dateUtil';
import { PickerHackContext, usePanelContext } from '../../context';
import TimeColumn, { type Unit } from './TimeColumn';
import cls from 'classnames';

function isAM(hour: number) {
  return hour < 12;
}

export type TimePanelBodyProps<DateType extends object = any> = SharedPanelProps<DateType>;

export default function TimePanelBody<DateType extends object = any>(
  props: SharedTimeProps<DateType>,
) {
  const {
    // Show Config
    showHour,
    showMinute,
    showSecond,
    showMillisecond,
    use12Hours: showMeridiem,

    // MISC
    changeOnScroll,
  } = props;

  const {
    prefixCls,
    classNames,
    styles,
    values,
    generateConfig,
    locale,
    onSelect,
    onHover = () => {},
    pickerValue,
  } = usePanelContext<DateType>();

  const value = values?.[0] || null;

  const { onCellDblClick } = React.useContext(PickerHackContext);

  // ========================== Info ==========================
  const [getValidTime, rowHourUnits, getMinuteUnits, getSecondUnits, getMillisecondUnits] =
    useTimeInfo(generateConfig, props, value);

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

  // ========================= Column =========================
  // Hours
  const hourUnits = React.useMemo(() => {
    if (!showMeridiem) {
      return rowHourUnits;
    }

    return isAM(hour)
      ? rowHourUnits.filter((h) => isAM(h.value as number))
      : rowHourUnits.filter((h) => !isAM(h.value as number));
  }, [hour, rowHourUnits, showMeridiem]);

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
    if (!showMeridiem) {
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
  }, [rowHourUnits, showMeridiem, generateConfig, locale]);

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
    let tmpl = value || pickerValue || generateConfig.getNow();

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
    value,
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

  // ===================== Columns Change =====================
  const fillColumnValue = (
    val: number | string,
    func: 'setHour' | 'setMinute' | 'setSecond' | 'setMillisecond',
  ) => {
    if (val === null) {
      return null;
    }
    return generateConfig[func](triggerDateTmpl, val as any);
  };

  const getNextHourTime = (val: number) => fillColumnValue(val, 'setHour');
  const getNextMinuteTime = (val: number) => fillColumnValue(val, 'setMinute');
  const getNextSecondTime = (val: number) => fillColumnValue(val, 'setSecond');
  const getNextMillisecondTime = (val: number) => fillColumnValue(val, 'setMillisecond');
  const getMeridiemTime = (val: string) => {
    if (val === null) {
      return null;
    }

    if (val === 'am' && !isAM(hour)) {
      return generateConfig.setHour(triggerDateTmpl, hour - 12);
    } else if (val === 'pm' && isAM(hour)) {
      return generateConfig.setHour(triggerDateTmpl, hour + 12);
    }
    return triggerDateTmpl;
  };

  const onHourChange = (val: number) => {
    triggerChange(getNextHourTime(val));
  };

  const onMinuteChange = (val: number) => {
    triggerChange(getNextMinuteTime(val));
  };

  const onSecondChange = (val: number) => {
    triggerChange(getNextSecondTime(val));
  };

  const onMillisecondChange = (val: number) => {
    triggerChange(getNextMillisecondTime(val));
  };

  const onMeridiemChange = (val: string) => {
    triggerChange(getMeridiemTime(val));
  };

  // ====================== Column Hover ======================
  const onHourHover = (val: number) => {
    onHover(getNextHourTime(val));
  };

  const onMinuteHover = (val: number) => {
    onHover(getNextMinuteTime(val));
  };

  const onSecondHover = (val: number) => {
    onHover(getNextSecondTime(val));
  };

  const onMillisecondHover = (val: number) => {
    onHover(getNextMillisecondTime(val));
  };

  const onMeridiemHover = (val: string) => {
    onHover(getMeridiemTime(val));
  };

  // ========================= Render =========================
  const sharedColumnProps = {
    onDblClick: onCellDblClick,
    changeOnScroll,
  };

  return (
    <div className={cls(`${prefixCls}-content`, classNames.content)} style={styles.content}>
      {showHour && (
        <TimeColumn
          units={hourUnits}
          value={hour}
          optionalValue={pickerHour}
          type="hour"
          onChange={onHourChange}
          onHover={onHourHover}
          {...sharedColumnProps}
        />
      )}
      {showMinute && (
        <TimeColumn
          units={minuteUnits}
          value={minute}
          optionalValue={pickerMinute}
          type="minute"
          onChange={onMinuteChange}
          onHover={onMinuteHover}
          {...sharedColumnProps}
        />
      )}
      {showSecond && (
        <TimeColumn
          units={secondUnits}
          value={second}
          optionalValue={pickerSecond}
          type="second"
          onChange={onSecondChange}
          onHover={onSecondHover}
          {...sharedColumnProps}
        />
      )}
      {showMillisecond && (
        <TimeColumn
          units={millisecondUnits}
          value={millisecond}
          optionalValue={pickerMillisecond}
          type="millisecond"
          onChange={onMillisecondChange}
          onHover={onMillisecondHover}
          {...sharedColumnProps}
        />
      )}
      {showMeridiem && (
        <TimeColumn
          units={meridiemUnits}
          value={meridiem}
          type="meridiem"
          onChange={onMeridiemChange}
          onHover={onMeridiemHover}
          {...sharedColumnProps}
        />
      )}
    </div>
  );
}

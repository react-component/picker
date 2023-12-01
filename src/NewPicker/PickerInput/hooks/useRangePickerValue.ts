import { useMergedState } from 'rc-util';
import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import * as React from 'react';
import type { GenerateConfig } from '../../../generate';
import { isSame } from '../../../utils/dateUtil';
import type { InternalMode, Locale, PanelMode } from '../../interface';
import type { RangePickerProps, RangeValueType } from '../RangePicker';

export function offsetPanelDate<DateType = any>(
  generateConfig: GenerateConfig<DateType>,
  picker: InternalMode,
  date: DateType,
  offset: number,
) {
  switch (picker) {
    case 'date':
    case 'week':
      return generateConfig.addMonth(date, offset);

    case 'month':
    case 'quarter':
      return generateConfig.addYear(date, offset);

    case 'year':
      return generateConfig.addYear(date, offset * 10);

    case 'decade':
      return generateConfig.addYear(date, offset * 100);

    default:
      return date;
  }
}

const EMPTY_LIST: RangeValueType<any> = [];

/** Merge the `showTime.defaultValue` into `pickerValue` */
function fillTimePickerValue<DateType>(
  generateConfig: GenerateConfig<DateType>,
  date: DateType,
  timePickerValue?: DateType,
) {
  let tmpDate = date;

  const getFn = ['getHour', 'getMinute', 'getSecond', 'getMillisecond'] as const;
  const setFn = ['setHour', 'setMinute', 'setSecond', 'setMillisecond'] as const;

  setFn.forEach((fn, index) => {
    if (timePickerValue) {
      tmpDate = generateConfig[fn](tmpDate, generateConfig[getFn[index]](timePickerValue));
    } else {
      tmpDate = generateConfig[fn](tmpDate, 0);
    }
  });

  return tmpDate;
}

export default function useRangePickerValue<DateType extends object = any>(
  generateConfig: GenerateConfig<DateType>,
  locale: Locale,
  calendarValue: RangeValueType<DateType>,
  open: boolean,
  activeIndex: number,
  pickerMode: InternalMode,
  multiplePanel: boolean,
  defaultPickerValue: RangeValueType<DateType> = EMPTY_LIST,
  pickerValue: RangeValueType<DateType> = EMPTY_LIST,
  // This is legacy from origin logic.
  // We will take `showTime.defaultValue` as the part of `pickerValue`
  timeDefaultValue: RangeValueType<DateType> = EMPTY_LIST,
  onPickerValueChange?: RangePickerProps<DateType>['onPickerValueChange'],
): [currentIndexPickerValue: DateType, setCurrentIndexPickerValue: (value: DateType) => void] {
  // ======================== Active ========================
  // `activeIndex` must be valid to avoid getting empty `pickerValue`
  const mergedActiveIndex = activeIndex || 0;

  // ===================== Picker Value =====================
  const getDefaultPickerValue = (index: number) =>
    defaultPickerValue[index] || calendarValue[index] || generateConfig.getNow();

  // Align `pickerValue` with `showTime.defaultValue`
  const [startPickerValue, endPickerValue] = pickerValue;

  // PickerValue state
  const [mergedStartPickerValue, setStartPickerValue] = useMergedState(
    () => getDefaultPickerValue(0),
    {
      value: startPickerValue,
    },
  );

  const [mergedEndPickerValue, setEndPickerValue] = useMergedState(() => getDefaultPickerValue(1), {
    value: endPickerValue,
  });

  // Current PickerValue
  const currentPickerValue = React.useMemo(
    () =>
      fillTimePickerValue(
        generateConfig,
        [mergedStartPickerValue, mergedEndPickerValue][mergedActiveIndex],
        timeDefaultValue[mergedActiveIndex],
      ),
    [
      mergedStartPickerValue,
      mergedEndPickerValue,
      mergedActiveIndex,
      generateConfig,
      timeDefaultValue,
    ],
  );

  const setCurrentPickerValue = (
    nextPickerValue: DateType,
    source: 'reset' | 'panel' = 'panel',
  ) => {
    const updater = [setStartPickerValue, setEndPickerValue][mergedActiveIndex];
    updater(nextPickerValue);

    const clone: [DateType, DateType] = [mergedStartPickerValue, mergedEndPickerValue];
    clone[mergedActiveIndex] = nextPickerValue;

    if (
      onPickerValueChange &&
      (!isSame(generateConfig, locale, mergedStartPickerValue, clone[0], pickerMode) ||
        !isSame(generateConfig, locale, mergedEndPickerValue, clone[1], pickerMode))
    ) {
      onPickerValueChange(clone, { source, range: mergedActiveIndex === 1 ? 'end' : 'start' });
    }
  };

  // ======================== Effect ========================
  // TODO: If date picker, first panel is all disabled
  /**
   * EndDate pickerValue is little different. It should be:
   * - If date picker (without time), endDate is not same year & month as startDate
   *   - pickerValue minus one month
   * - Else pass directly
   */
  const getEndDatePickerValue = (startDate: DateType, endDate: DateType) => {
    if (multiplePanel) {
      // Basic offset
      const SAME_CHECKER: Partial<Record<InternalMode, PanelMode>> = {
        date: 'month',
        week: 'month',
        month: 'year',
        quarter: 'year',
      };

      const mode = SAME_CHECKER[pickerMode];
      if (mode && !isSame(generateConfig, locale, startDate, endDate, mode)) {
        return offsetPanelDate(generateConfig, pickerMode, endDate, -1);
      }

      // Year offset
      if (pickerMode === 'year') {
        const srcYear = Math.floor(generateConfig.getYear(startDate) / 10);
        const tgtYear = Math.floor(generateConfig.getYear(endDate) / 10);
        if (srcYear !== tgtYear) {
          return offsetPanelDate(generateConfig, pickerMode, endDate, -1);
        }
      }
    }

    return endDate;
  };

  // >>> calendarValue: Sync with `calendarValue` if changed
  useLayoutEffect(() => {
    if (open) {
      const [startDate, endDate] = calendarValue;

      if (
        // When `active = 1` and `endDate` is valid
        (mergedActiveIndex === 1 && endDate) ||
        // Or `active = 0` and `startDate` is invalid but `endDate` is valid
        (mergedActiveIndex === 0 && !startDate && endDate)
      ) {
        setCurrentPickerValue(
          // End PickerValue need additional shift
          getEndDatePickerValue(startDate, endDate),
          'reset',
        );
      } else if (startDate) {
        // When `active = 0` and `startDate` is valid
        // Or `active = 1` and `endDate` is invalid but `startDate` is valid
        setCurrentPickerValue(startDate, 'reset');
      }
    }
  }, [open, calendarValue, mergedActiveIndex]);

  // >>> defaultPickerValue: Resync to `defaultPickerValue` for each panel focused
  useLayoutEffect(() => {
    if (open && defaultPickerValue) {
      if (mergedActiveIndex === 0 && defaultPickerValue[0]) {
        setCurrentPickerValue(defaultPickerValue[0], 'reset');
      } else if (mergedActiveIndex === 1 && defaultPickerValue[1]) {
        setCurrentPickerValue(defaultPickerValue[1], 'reset');
      }
    }
  }, [open, mergedActiveIndex]);

  return [currentPickerValue, setCurrentPickerValue];
}

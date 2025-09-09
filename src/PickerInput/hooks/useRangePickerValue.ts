import { useControlledState } from '@rc-component/util';
import useLayoutEffect from '@rc-component/util/lib/hooks/useLayoutEffect';
import * as React from 'react';
import type { GenerateConfig } from '../../generate';
import type { InternalMode, Locale, PanelMode } from '../../interface';
import { fillTime, isSame } from '../../utils/dateUtil';
import type { RangePickerProps } from '../RangePicker';

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

const EMPTY_LIST = [];

export default function useRangePickerValue<DateType extends object, ValueType extends DateType[]>(
  generateConfig: GenerateConfig<DateType>,
  locale: Locale,
  calendarValue: ValueType,
  modes: PanelMode[],
  open: boolean,
  activeIndex: number,
  pickerMode: InternalMode,
  multiplePanel: boolean,
  defaultPickerValue: ValueType = EMPTY_LIST as ValueType,
  pickerValue: ValueType = EMPTY_LIST as ValueType,
  // This is legacy from origin logic.
  // We will take `showTime.defaultValue` as the part of `pickerValue`
  timeDefaultValue: ValueType = EMPTY_LIST as ValueType,
  onPickerValueChange?: RangePickerProps<DateType>['onPickerValueChange'],
  minDate?: DateType,
  maxDate?: DateType,
): [currentIndexPickerValue: DateType, setCurrentIndexPickerValue: (value: DateType) => void] {
  const isTimePicker = pickerMode === 'time';

  // ======================== Active ========================
  // `activeIndex` must be valid to avoid getting empty `pickerValue`
  const mergedActiveIndex = activeIndex || 0;

  // ===================== Picker Value =====================
  const getDefaultPickerValue = (index: number) => {
    let now = generateConfig.getNow();
    if (isTimePicker) {
      now = fillTime(generateConfig, now);
    }

    return defaultPickerValue[index] || calendarValue[index] || now;
  };

  // Align `pickerValue` with `showTime.defaultValue`
  const [startPickerValue, endPickerValue] = pickerValue;

  // PickerValue state
  const [mergedStartPickerValue, setStartPickerValue] = useControlledState(
    () => getDefaultPickerValue(0),
    startPickerValue,
  );

  const [mergedEndPickerValue, setEndPickerValue] = useControlledState(
    () => getDefaultPickerValue(1),
    endPickerValue,
  );

  // Current PickerValue
  const currentPickerValue = React.useMemo(() => {
    const current = [mergedStartPickerValue, mergedEndPickerValue][mergedActiveIndex];

    // Merge the `showTime.defaultValue` into `pickerValue`
    return isTimePicker
      ? current
      : fillTime(generateConfig, current, timeDefaultValue[mergedActiveIndex]);
  }, [
    isTimePicker,
    mergedStartPickerValue,
    mergedEndPickerValue,
    mergedActiveIndex,
    generateConfig,
    timeDefaultValue,
  ]);

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
      onPickerValueChange(clone, {
        source,
        range: mergedActiveIndex === 1 ? 'end' : 'start',
        mode: modes as any,
      });
    }
  };

  // ======================== Effect ========================
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
      if (pickerMode === 'year' && startDate) {
        const srcYear = Math.floor(generateConfig.getYear(startDate) / 10);
        const tgtYear = Math.floor(generateConfig.getYear(endDate) / 10);
        if (srcYear !== tgtYear) {
          return offsetPanelDate(generateConfig, pickerMode, endDate, -1);
        }
      }
    }

    return endDate;
  };

  // >>> When switch field, reset the picker value as prev field picker value
  const prevActiveIndexRef = React.useRef<number>(null);
  useLayoutEffect(() => {
    if (open) {
      if (!defaultPickerValue[mergedActiveIndex]) {
        let nextPickerValue: DateType = isTimePicker ? null : generateConfig.getNow();

        /**
         * 1. If has prevActiveIndex, use it to avoid panel jump
         * 2. If current field has value
         *    - If `activeIndex` is 1 and `calendarValue[0]` is not same panel as `calendarValue[1]`,
         *      offset `calendarValue[1]` and set it
         *    - Else use `calendarValue[activeIndex]`
         * 3. If current field has no value but another field has value, use another field value
         * 4. Else use now (not any `calendarValue` can ref)
         */

        if (
          prevActiveIndexRef.current !== null &&
          prevActiveIndexRef.current !== mergedActiveIndex
        ) {
          // If from another field, not jump picker value
          nextPickerValue = [mergedStartPickerValue, mergedEndPickerValue][mergedActiveIndex ^ 1];
        } else if (calendarValue[mergedActiveIndex]) {
          // Current field has value
          nextPickerValue =
            mergedActiveIndex === 0
              ? calendarValue[0]
              : getEndDatePickerValue(calendarValue[0], calendarValue[1]);
        } else if (calendarValue[mergedActiveIndex ^ 1]) {
          // Current field has no value but another field has value
          nextPickerValue = calendarValue[mergedActiveIndex ^ 1];
        }

        // Only sync when has value, this will sync in the `min-max` logic
        if (nextPickerValue) {
          // nextPickerValue < minDate
          if (minDate && generateConfig.isAfter(minDate, nextPickerValue)) {
            nextPickerValue = minDate;
          }

          // maxDate < nextPickerValue
          const offsetPickerValue = multiplePanel
            ? offsetPanelDate(generateConfig, pickerMode, nextPickerValue, 1)
            : nextPickerValue;
          if (maxDate && generateConfig.isAfter(offsetPickerValue, maxDate)) {
            nextPickerValue = multiplePanel
              ? offsetPanelDate(generateConfig, pickerMode, maxDate, -1)
              : maxDate;
          }

          setCurrentPickerValue(nextPickerValue, 'reset');
        }
      }
    }
  }, [open, mergedActiveIndex, calendarValue[mergedActiveIndex]]);

  // >>> Reset prevActiveIndex when panel closed
  React.useEffect(() => {
    if (open) {
      prevActiveIndexRef.current = mergedActiveIndex;
    } else {
      prevActiveIndexRef.current = null;
    }
  }, [open, mergedActiveIndex]);

  // >>> defaultPickerValue: Resync to `defaultPickerValue` for each panel focused
  useLayoutEffect(() => {
    if (open && defaultPickerValue) {
      if (defaultPickerValue[mergedActiveIndex]) {
        setCurrentPickerValue(defaultPickerValue[mergedActiveIndex], 'reset');
      }
    }
  }, [open, mergedActiveIndex]);

  return [currentPickerValue, setCurrentPickerValue];
}

import { useMergedState } from 'rc-util';
import * as React from 'react';
import type { GenerateConfig } from '../../../generate';
import { isSameMonth } from '../../../utils/dateUtil';
import type { InternalMode } from '../../interface';
import type { RangeValueType } from '../RangePicker';

export default function useRangePickerValue<DateType = any>(
  generateConfig: GenerateConfig<DateType>,
  calendarValue: RangeValueType<DateType>,
  open: boolean,
  activeIndex: number,
  pickerMode: InternalMode,
  defaultPickerValue?: RangeValueType<DateType>,
  pickerValue?: RangeValueType<DateType>,
  onPickerValueChange?: (values: RangeValueType<DateType>) => void,
): [currentIndexPickerValue: DateType, setCurrentIndexPickerValue: (value: DateType) => void] {
  // ===================== Picker Value =====================
  const [mergedStartPickerValue, setStartPickerValue] = useMergedState(
    () => defaultPickerValue?.[0] || calendarValue?.[0] || generateConfig.getNow(),
    {
      value: pickerValue?.[0],
    },
  );

  const [mergedEndPickerValue, setEndPickerValue] = useMergedState(
    () => defaultPickerValue?.[1] || calendarValue?.[1] || generateConfig.getNow(),
    {
      value: pickerValue?.[1],
    },
  );

  const currentPickerValue = [mergedStartPickerValue, mergedEndPickerValue][activeIndex];
  const setCurrentPickerValue = (nextPickerValue: DateType) => {
    const updater = [setStartPickerValue, setEndPickerValue][activeIndex];
    updater(nextPickerValue);

    const clone: [DateType, DateType] = [mergedStartPickerValue, mergedEndPickerValue];
    clone[activeIndex] = nextPickerValue;
    onPickerValueChange?.(clone);
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
    if (pickerMode === 'date' && !isSameMonth(generateConfig, startDate, endDate)) {
      return generateConfig.addMonth(endDate, -1);
    }
    return endDate;
  };

  // >>> calendarValue: Sync with `calendarValue` if changed
  React.useEffect(() => {
    if (open) {
      if (activeIndex === 0 && calendarValue[0]) {
        setCurrentPickerValue(calendarValue[0]);
      } else if (activeIndex === 1 && calendarValue[1]) {
        setCurrentPickerValue(
          // End PickerValue need additional shift
          getEndDatePickerValue(calendarValue[0], calendarValue[1]),
        );
      }
    }
  }, [calendarValue]);

  // >>> defaultPickerValue: Resync to `defaultPickerValue` for each panel focused
  React.useEffect(() => {
    if (open && defaultPickerValue) {
      if (activeIndex === 0 && defaultPickerValue[0]) {
        setStartPickerValue(defaultPickerValue[0]);
      } else if (activeIndex === 1 && defaultPickerValue[1]) {
        setEndPickerValue(defaultPickerValue[1]);
      }
    }
  }, [open, activeIndex]);

  return [currentPickerValue, setCurrentPickerValue];
}

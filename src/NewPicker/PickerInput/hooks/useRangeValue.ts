import { useMergedState } from 'rc-util';
import type { GenerateConfig } from '../../../generate';
import { isSameTimestamp } from '../../../utils/dateUtil';
import type { Locale } from '../../interface';
import type { RangePickerProps, RangeValueType } from '../RangePicker';

// Submit Logic (with order):
// * All the input is filled step by step
// * None of the Picker has focused anymore

type SetValue<DateType> = (val: RangeValueType<DateType>) => void;

type TriggerChange<DateType> = ([start, end]: RangeValueType<DateType>, source?: 'submit') => void;

export default function useRangeValue<DateType = any>(
  value: RangeValueType<DateType>,
  defaultValue: RangeValueType<DateType>,
  generateConfig: GenerateConfig<DateType>,
  locale: Locale,
  formatList: string[],
  allowEmpty: [boolean | undefined, boolean | undefined],
  order: boolean,
  onCalendarChange?: RangePickerProps<DateType>['onCalendarChange'],
  onChange?: RangePickerProps<DateType>['onChange'],
): [
  mergedValue: RangeValueType<DateType>,
  setMergedValue: SetValue<DateType>,
  submitValue: RangeValueType<DateType>,
  setSubmitValue: SetValue<DateType>,
  triggerChange: TriggerChange<DateType>,
] {
  // ============================ Values ============================
  const valueConfig = {
    value,
    postState: (valList: RangeValueType<DateType>): RangeValueType<DateType> =>
      valList || [null, null],
  };

  // Used for internal value management.
  // It should always use `mergedValue` in render logic
  const [mergedValue, setMergedValue] = useMergedState(defaultValue, valueConfig);

  // Used for trigger `onChange` event.
  // Record current submitted value.
  const [submitValue, setSubmitValue] = useMergedState(defaultValue, valueConfig);

  // ============================ Change ============================
  const getDateTexts = (dateList: RangeValueType<DateType>) => {
    return dateList.map((date) =>
      date ? generateConfig.locale.format(locale.locale, date, formatList[0]) : '',
    ) as [string, string];
  };

  const isSameDates = (source: RangeValueType<DateType>, target: RangeValueType<DateType>) => {
    const [prevSubmitStart, prevSubmitEnd] = source;

    const isSameStart = isSameTimestamp(generateConfig, prevSubmitStart, target[0]);
    const isSameEnd = isSameTimestamp(generateConfig, prevSubmitEnd, target[1]);

    return [isSameStart && isSameEnd, isSameStart, isSameEnd];
  };

  const triggerChange = ([start, end]: RangeValueType<DateType>, source?: 'submit') => {
    const clone: RangeValueType<DateType> = [start, end];

    // Only when exist value to sort
    if (order && source === 'submit' && clone[0] && clone[1]) {
      clone.sort((a, b) => (generateConfig.isAfter(a, b) ? 1 : -1));
    }

    // Update merged value
    const [isSameMergedDates, isSameStart] = isSameDates(mergedValue, clone);

    if (!isSameMergedDates) {
      setMergedValue(clone);

      // Trigger calendar change event
      if (onCalendarChange) {
        onCalendarChange(clone, getDateTexts(clone), {
          range: isSameStart ? 'end' : 'start',
        });
      }
    }

    // Update `submitValue` to trigger event by effect
    if (source === 'submit') {
      setSubmitValue(clone);

      // Trigger `onChange` if needed
      const [isSameSubmitDates] = isSameDates(submitValue, clone);

      const startEmpty = !clone[0];
      const endEmpty = !clone[1];

      if (
        onChange &&
        !isSameSubmitDates &&
        // Validate start
        (!startEmpty || allowEmpty[0]) &&
        // Validate end
        (!endEmpty || allowEmpty[1])
      ) {
        onChange(clone, getDateTexts(clone));
      }
    }
  };

  // ============================ Return ============================
  return [mergedValue, setMergedValue, submitValue, setSubmitValue, triggerChange];
}

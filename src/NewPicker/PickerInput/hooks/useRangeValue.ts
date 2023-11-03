import { useEvent, useMergedState } from 'rc-util';
import { isSameTimestamp } from '../../../utils/dateUtil';
import type { RangePickerProps, RangeValueType } from '../RangePicker';
import { useLockEffect } from './useLockState';

// Submit Logic (with order):
// * Submit by next input
// * None of the Picker has focused anymore

type TriggerChange<DateType> = ([start, end]: RangeValueType<DateType>, source?: 'submit') => void;

export default function useRangeValue<DateType = any>(
  info: Pick<
    RangePickerProps<DateType>,
    | 'value'
    | 'defaultValue'
    | 'generateConfig'
    | 'locale'
    | 'allowEmpty'
    | 'order'
    | 'onCalendarChange'
    | 'onChange'
    | 'preserveInvalidOnBlur'
  > & {
    formatList: string[];
    focused: boolean;
  },
): [
  mergedValue: RangeValueType<DateType>,
  triggerCalendarChange: TriggerChange<DateType>,
  triggerSubmitChange: (value: RangeValueType<DateType>) => void,
] {
  const {
    value,
    defaultValue,
    generateConfig,
    locale,
    formatList,
    allowEmpty,
    order = true,
    onCalendarChange,
    onChange,
    focused,
    preserveInvalidOnBlur,
  } = info;

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

  const triggerCalendarChange = ([start, end]: RangeValueType<DateType>) => {
    const clone: RangeValueType<DateType> = [start, end];

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
  };

  // ============================ Effect ============================
  const triggerSubmit = useEvent((nextValue?: RangeValueType<DateType>) => {
    const clone: RangeValueType<DateType> = [...(nextValue || mergedValue)];

    // Only when exist value to sort
    if (order && clone[0] && clone[1]) {
      clone.sort((a, b) => (generateConfig.isAfter(a, b) ? 1 : -1));
    }

    // Sync `calendarValue`
    triggerCalendarChange(clone);

    // Validate check
    const startEmpty = !clone[0];
    const endEmpty = !clone[1];

    const validateDateRange =
      // Validate start
      (!startEmpty || allowEmpty[0]) &&
      // Validate end
      (!endEmpty || allowEmpty[1]);

    if (validateDateRange) {
      // Sync state
      setSubmitValue(clone);

      // Trigger `onChange` if needed
      if (onChange) {
        const [isSameSubmitDates] = isSameDates(submitValue, clone);

        if (!isSameSubmitDates && validateDateRange) {
          onChange(clone, getDateTexts(clone));
        }
      }
    }

    return validateDateRange;
  });

  // From the 2 active panel finished
  const triggerSubmitChange = (nextValue: RangeValueType<DateType>) => {
    triggerSubmit(nextValue);
  };

  useLockEffect(focused, () => {
    if (!focused) {
      const validatedSubmitValue = triggerSubmit();

      // When blur & invalid, restore to empty one
      // This is used for typed only one input
      if (!validatedSubmitValue && !preserveInvalidOnBlur) {
        setMergedValue([]);
      }
    }
  });

  // ============================ Return ============================
  return [mergedValue, triggerCalendarChange, triggerSubmitChange];
}

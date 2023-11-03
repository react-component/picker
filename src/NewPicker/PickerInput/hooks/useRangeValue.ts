import { useEvent, useMergedState } from 'rc-util';
import { useLayoutUpdateEffect } from 'rc-util/lib/hooks/useLayoutEffect';
import * as React from 'react';
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
    disabled: [boolean, boolean];
  },
): [
  calendarValue: RangeValueType<DateType>,
  triggerCalendarChange: TriggerChange<DateType>,
  triggerSubmitChange: (value: RangeValueType<DateType>) => void,
] {
  const {
    // MISC
    generateConfig,
    locale,
    formatList,

    // Value
    value,
    defaultValue,
    onCalendarChange,
    onChange,

    // Focus
    focused,
    preserveInvalidOnBlur,

    // Checker
    allowEmpty,
    disabled,
    order = true,
  } = info;

  // When exist disabled, it should not support order
  const mergedOrder = disabled.some((d) => d) ? false : order;

  // ============================ Values ============================
  const [cachedDefaultValue] = React.useState(defaultValue);

  // Used for internal value management.
  // It should always use `mergedValue` in render logic
  const [internalCalendarValue, setCalendarValue] = React.useState(cachedDefaultValue || value);
  const calendarValue = internalCalendarValue || [null, null];

  useLayoutUpdateEffect(() => {
    setCalendarValue(value);
  }, [value]);

  // Used for trigger `onChange` event.
  // Record current submitted value.
  const [submitValue, setSubmitValue] = useMergedState(defaultValue, {
    value,
    postState: (valList: RangeValueType<DateType>): RangeValueType<DateType> =>
      valList || [null, null],
  });

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
    const [isSameMergedDates, isSameStart] = isSameDates(calendarValue, clone);

    if (!isSameMergedDates) {
      setCalendarValue(clone);

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
    const clone: RangeValueType<DateType> = [...(nextValue || calendarValue)];

    // Only when exist value to sort
    if (mergedOrder && clone[0] && clone[1]) {
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
      // Sync calendar value with current value
      setCalendarValue(cachedDefaultValue || value);

      // Sync submit value to not to trigger `onChange` again
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
        setCalendarValue([]);
      }
    }
  });

  // ============================ Return ============================
  return [calendarValue, triggerCalendarChange, triggerSubmitChange];
}

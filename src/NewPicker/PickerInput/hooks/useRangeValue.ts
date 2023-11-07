import { useEvent, useMergedState } from 'rc-util';
import * as React from 'react';
import { isSame, isSameTimestamp } from '../../../utils/dateUtil';
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
    | 'picker'
  >,
  formatList: string[],
  focused: boolean,
  blurRef: React.RefObject<'input' | 'panel'>,
  orderOnChange: boolean,
  isInvalidateDate: (date: DateType) => boolean,
  needConfirm: boolean,
): [
  calendarValue: RangeValueType<DateType>,
  triggerCalendarChange: TriggerChange<DateType>,
  triggerSubmitChange: (value: RangeValueType<DateType>) => void,
] {
  const {
    // MISC
    generateConfig,
    locale,

    picker,

    // Value
    value,
    defaultValue,
    onCalendarChange,
    onChange,

    // Focus
    preserveInvalidOnBlur,

    // Checker
    allowEmpty,
    order,
  } = info;

  // ============================ Values ============================
  // Used for internal value management.
  // It should always use `mergedValue` in render logic
  const [internalCalendarValue, setCalendarValue] = React.useState<RangeValueType<DateType>>(
    defaultValue || [null, null],
  );
  const calendarValue = internalCalendarValue || [null, null];

  React.useEffect(() => {
    if (value) {
      setCalendarValue(value);
    }
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

  // ============================ Submit ============================
  const [lastSubmitResult, setLastSubmitResult] = React.useState<[passed: boolean]>([true]);

  const triggerSubmit = useEvent((nextValue?: RangeValueType<DateType>) => {
    const clone: RangeValueType<DateType> = [...(nextValue || calendarValue)];

    // Only when exist value to sort
    if (orderOnChange && clone[0] && clone[1]) {
      clone.sort((a, b) => (generateConfig.isAfter(a, b) ? 1 : -1));
    }

    // Sync `calendarValue`
    triggerCalendarChange(clone);

    // ========= Validate check =========
    const [start, end] = clone;

    // >>> Empty
    const startEmpty = !start;
    const endEmpty = !end;

    const validateEmptyDateRange =
      // Validate empty start
      (!startEmpty || allowEmpty[0]) &&
      // Validate empty end
      (!endEmpty || allowEmpty[1]);

    // >>> Order
    const validateOrder =
      !order ||
      startEmpty ||
      endEmpty ||
      isSame(generateConfig, locale, start, end, picker) ||
      generateConfig.isAfter(end, start);

    // >>> Invalid
    const validateDates =
      // Validate start
      (!start || !isInvalidateDate(start)) &&
      // Validate end
      (!end || !isInvalidateDate(end));

    // >>> Result
    const allPassed = validateEmptyDateRange && validateOrder && validateDates;

    if (allPassed) {
      // Sync submit value to not to trigger `onChange` again
      setSubmitValue(clone);

      // Trigger `onChange` if needed
      if (onChange) {
        const [isSameSubmitDates] = isSameDates(submitValue, clone);

        if (!isSameSubmitDates && validateEmptyDateRange) {
          onChange(clone, getDateTexts(clone));
        }
      }
    }

    setLastSubmitResult([allPassed]);
  });

  // From the 2 active panel finished
  const triggerSubmitChange = (nextValue: RangeValueType<DateType>) => {
    triggerSubmit(nextValue);
  };

  // ============================ Effect ============================
  useLockEffect(focused, () => {
    if (!focused) {
      // If panel no need panel confirm or last blur is not from panel
      // Trigger submit
      if (!needConfirm || blurRef.current !== 'panel') {
        triggerSubmit();
      } else {
        // Else should reset `calendarValue` to `submitValue`
        setCalendarValue(submitValue);
      }
    }
  });

  // When blur & invalid, restore to empty one
  // This is used for typed only one input
  React.useEffect(() => {
    if (!lastSubmitResult[0] && !preserveInvalidOnBlur && value) {
      triggerCalendarChange(value);
    }
  }, [lastSubmitResult]);

  // ============================ Return ============================
  return [calendarValue, triggerCalendarChange, triggerSubmitChange];
}

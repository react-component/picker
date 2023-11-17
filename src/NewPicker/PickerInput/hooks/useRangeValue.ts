import { useEvent, useMergedState } from 'rc-util';
import * as React from 'react';
import { formatValue, isSame, isSameTimestamp } from '../../../utils/dateUtil';
import type { FormatType } from '../../interface';
import type { RangePickerProps, RangeValueType } from '../RangePicker';
import { useLockEffect } from './useLockState';
import type { OperationType } from './useRangeActive';

// Submit Logic (with order):
// * Submit by next input
// * None of the Picker has focused anymore

/**
 * `eventOnly` means only trigger `onCalendarChange` event
 * but not update internal `calendarValue` state
 */
type TriggerCalendarChange<DateType> = (
  [start, end]: RangeValueType<DateType>,
  eventOnly?: boolean,
) => void;

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
  disabled: [boolean, boolean],
  formatList: FormatType[],
  focused: boolean,
  lastOperation: () => OperationType,
  isInvalidateDate: (date: DateType) => boolean,
  needConfirm: boolean,
): [
  calendarValue: RangeValueType<DateType>,
  triggerCalendarChange: TriggerCalendarChange<DateType>,
  triggerSubmitChange: (value: RangeValueType<DateType>) => boolean,
  emptyValue: boolean,
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

  const orderOnChange = disabled.some((d) => d) ? false : order;

  // ============================ Values ============================
  // Used for internal value management.
  // It should always use `mergedValue` in render logic
  const [internalCalendarValue, setCalendarValue] = React.useState<RangeValueType<DateType>>(
    defaultValue || null,
  );
  const calendarValue = internalCalendarValue || [null, null];

  React.useEffect(() => {
    if (value || value === null) {
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
  const getDateTexts = ([start, end]: RangeValueType<DateType>) => {
    return [start, end].map((date) =>
      formatValue(date, { generateConfig, locale, format: formatList[0] }),
    ) as [string, string];
  };

  const isSameDates = (source: RangeValueType<DateType>, target: RangeValueType<DateType>) => {
    const [prevStart = null, prevEnd = null] = source;
    const [nextStart = null, nextEnd = null] = target;

    const isSameStart =
      prevStart === nextStart || isSameTimestamp(generateConfig, prevStart, nextStart);
    const isSameEnd = prevEnd === nextEnd || isSameTimestamp(generateConfig, prevEnd, nextEnd);

    return [isSameStart && isSameEnd, isSameStart, isSameEnd];
  };

  const triggerCalendarChange: TriggerCalendarChange<DateType> = ([start, end], eventOnly) => {
    const clone: RangeValueType<DateType> = [start, end];

    // Update merged value
    const [isSameMergedDates, isSameStart] = isSameDates(calendarValue, clone);

    if (!isSameMergedDates) {
      if (!eventOnly) {
        setCalendarValue(clone);
      }

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
    const isNullValue = nextValue === null;

    const clone: RangeValueType<DateType> = [...(nextValue || calendarValue)];

    // Fill null value
    if (isNullValue) {
      disabled.forEach((fieldDisabled, index) => {
        if (!fieldDisabled) {
          clone[index] = null;
        }
      });
    }

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
    const allPassed =
      // Null value is from clear button
      isNullValue ||
      // Normal check
      (validateEmptyDateRange && validateOrder && validateDates);

    if (allPassed) {
      // Sync submit value to not to trigger `onChange` again
      setSubmitValue(clone);

      // Trigger `onChange` if needed
      if (onChange) {
        const [isSameSubmitDates] = isSameDates(submitValue, clone);

        if (!isSameSubmitDates) {
          onChange(
            // Return null directly if all date are empty
            isNullValue && clone.every((val) => !val) ? null : clone,
            getDateTexts(clone),
          );
        }
      }
    }

    setLastSubmitResult([allPassed]);

    return allPassed;
  });

  // From the 2 active panel finished
  const triggerSubmitChange = (nextValue: RangeValueType<DateType>) => triggerSubmit(nextValue);

  // ============================ Effect ============================
  useLockEffect(focused, () => {
    if (!focused) {
      // If panel no need panel confirm or last blur is not from panel
      // Trigger submit
      if (!needConfirm || lastOperation() !== 'panel') {
        triggerSubmit();
      } else {
        // Else should reset `calendarValue` to `submitValue`
        setCalendarValue(submitValue);
      }
    }
  });

  // TODO: 非受控下 `value` 这个不会重置，逻辑应该不对
  // When blur & invalid, restore to empty one
  // This is used for typed only one input
  // React.useEffect(() => {
  //   if (!lastSubmitResult[0] && !preserveInvalidOnBlur && value) {
  //     triggerCalendarChange(value);
  //   }
  // }, [lastSubmitResult]);

  // ============================ Return ============================
  return [
    calendarValue,
    triggerCalendarChange,
    triggerSubmitChange,
    internalCalendarValue === null,
  ];
}

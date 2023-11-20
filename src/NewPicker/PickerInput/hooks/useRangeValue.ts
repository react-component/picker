import { useEvent, useMergedState } from 'rc-util';
import * as React from 'react';
import { formatValue, isSame, isSameTimestamp } from '../../../utils/dateUtil';
import type { FormatType } from '../../interface';
import { fillIndex } from '../../util';
import type { RangePickerProps, RangeValueType } from '../RangePicker';
import type { OperationType } from './useRangeActive';

const EMPTY_VALUE: [null, null] = [null, null];

// Submit Logic:
// * Calender Value:
//    * 💻 When user typing is validate, change the calendar value
//    * 🌅 When user click on the panel, change the calendar value
// * Submit Value:
//    * 💻 When user blur the input, flush calendar value to submit value
//    * 🌅 When user click on the panel is no needConfirm, flush calendar value to submit value
//    * 🌅 When user click on the panel is needConfirm and click OK, flush calendar value to submit value
//    * All the flush will mark submitted as false
// * Blur logic:
//    * If `needConfirm`, reset calendar value to value
//    * If `!needConfirm`, and last operation is panel and has empty value,
//    * active another input.
// * onChange:
//    * If all the start & end field is used or all blur or panel closed
//    * trigger onChange if submitted is false and reset it to true
// * onBlur:
//    * Reset calendar value to submit value

type TriggerCalendarChange<DateType> = ([start, end]: RangeValueType<DateType>) => void;

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
  flushSubmit: (index: number, needTriggerChange: boolean) => void,
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

  // ============================= Util =============================
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

  // ============================ Values ============================
  // This is the root value which will sync with controlled or uncontrolled value
  const [innerValue, setInnerValue] = useMergedState(defaultValue, {
    value,
  });
  const mergedValue = innerValue || EMPTY_VALUE;

  // ========================= Inner Values =========================
  // Used for internal value management.
  // It should always use `mergedValue` in render logic
  const [calendarValue, setInternalCalendarValue] =
    React.useState<RangeValueType<DateType>>(mergedValue);

  // Add little trick here to ensure always use latest value
  const calendarValueRef = React.useRef(calendarValue);
  calendarValueRef.current = calendarValue;
  const getCalendarValue = () => calendarValueRef.current;

  // Used for trigger `onChange` event.
  // Record current value which is wait for submit.
  const [submitValue, setSubmitValue] = React.useState(mergedValue);

  const [needSubmit, setNeedSubmit] = React.useState(false);

  // Update calendar value
  const setCalendarValue = (val: RangeValueType<DateType>) => {
    calendarValueRef.current = val;

    setInternalCalendarValue(val);
  };

  const syncWithValue = useEvent(() => {
    setCalendarValue(mergedValue);
    setSubmitValue(mergedValue);
    setNeedSubmit(false);
  });

  React.useEffect(() => {
    syncWithValue();
  }, [mergedValue]);

  // ============================ Change ============================
  const triggerCalendarChange: TriggerCalendarChange<DateType> = useEvent(([start, end]) => {
    const clone: RangeValueType<DateType> = [start, end];

    // Update merged value
    const [isSameMergedDates, isSameStart] = isSameDates(getCalendarValue(), clone);

    if (!isSameMergedDates) {
      setCalendarValue(clone);

      // Trigger calendar change event
      if (onCalendarChange) {
        onCalendarChange(clone, getDateTexts(clone), {
          range: isSameStart ? 'end' : 'start',
        });
      }
    }
  });

  // ========================= Flush Submit =========================
  const flushSubmit = (index: number, needTriggerChange: boolean) => {
    setSubmitValue((ori) => fillIndex(ori, index, getCalendarValue()[index]));

    if (needTriggerChange) {
      setNeedSubmit(true);
    }
  };

  // ============================ Submit ============================
  const [lastSubmitResult, setLastSubmitResult] = React.useState<[passed: boolean]>([true]);

  const triggerSubmit = useEvent((nextValue?: RangeValueType<DateType>) => {
    const isNullValue = nextValue === null;

    const clone: RangeValueType<DateType> = [...(nextValue || submitValue)];

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
      syncWithValue();

      // Trigger `onChange` if needed
      onChange(
        // Return null directly if all date are empty
        isNullValue && clone.every((val) => !val) ? null : clone,
        getDateTexts(clone),
      );
    }

    setLastSubmitResult([allPassed]);

    return allPassed;
  });

  // ============================ Effect ============================
  React.useEffect(() => {
    if (needSubmit) {
      triggerSubmit();
    }
  }, [needSubmit]);

  // useLockEffect(focused, () => {
  //   if (!focused) {
  //     // If panel no need panel confirm or last blur is not from panel
  //     // Trigger submit
  //     if (!needConfirm || lastOperation() !== 'panel') {
  //       triggerSubmit();
  //     } else {
  //       // Else should reset `calendarValue` to `submitValue`
  //       setCalendarValue(submitValue);
  //     }
  //   }
  // });

  // TODO: 非受控下 `value` 这个不会重置，逻辑应该不对
  // When blur & invalid, restore to empty one
  // This is used for typed only one input
  // React.useEffect(() => {
  //   if (!lastSubmitResult[0] && !preserveInvalidOnBlur && value) {
  //     triggerCalendarChange(value);
  //   }
  // }, [lastSubmitResult]);

  // ============================ Return ============================
  return [calendarValue, triggerCalendarChange, flushSubmit, triggerSubmit, innerValue === null];
}

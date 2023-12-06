import { useEvent, useMergedState } from 'rc-util';
import * as React from 'react';
import type { GenerateConfig } from '../../../generate';
import { isSame } from '../../../utils/dateUtil';
import useSyncState from '../../hooks/useSyncState';
import type { FormatType, Locale } from '../../interface';
import { fillIndex } from '../../util';
import type { RangePickerProps } from '../RangePicker';
import type { PickerProps } from '../SinglePicker';
import useLockEffect from './useLockEffect';
import { useCalendarValue, useUtil } from './useRangeValue';

const EMPTY_VALUE: any[] = [];

// Single Value is similar to Range Value, but it's more simple.
// This is design to support single value or multiple value,
// Thus this hook reuse part of the util from `useRangeValue`.

type TriggerCalendarChange<DateType> = (dates: DateType[]) => void;

// export function useInnerValue<DateType extends object = any>(
//   multiple: boolean,
//   generateConfig: GenerateConfig<DateType>,
//   locale: Locale,
//   formatList: FormatType[],

//   defaultValue?: DateType,
//   value?: DateType,
//   onCalendarChange?: PickerProps<DateType>['onCalendarChange'],
// ) {
//   // This is the root value which will sync with controlled or uncontrolled value
//   const [innerValue, setInnerValue] = useMergedState(defaultValue, {
//     value,
//   });
//   const mergedValue = React.useMemo<DateType[]>(() => {
//     const filledValue = innerValue || EMPTY_VALUE;

//     return Array.isArray(filledValue) ? filledValue : [filledValue];
//   }, [innerValue]);

//   // ========================= Inner Values =========================
//   const [calendarValue, setCalendarValue] = useCalendarValue(mergedValue);

//   // ============================ Change ============================
//   const [getDateTexts, isSameDates] = useUtil<DateType, DateType[]>(
//     generateConfig,
//     locale,
//     formatList,
//   );

//   function pickByMultiple<T>(values: T[]): any {
//     return multiple ? values : values[0];
//   }

//   const triggerCalendarChange: TriggerCalendarChange<DateType> = useEvent((dates) => {
//     const clone: DateType[] = [...dates];

//     // Update merged value
//     const [isSameMergedDates, isSameStart] = isSameDates(calendarValue(), clone);

//     if (!isSameMergedDates) {
//       setCalendarValue(clone);

//       // Trigger calendar change event
//       if (onCalendarChange) {
//         onCalendarChange(pickByMultiple(clone), pickByMultiple(getDateTexts(clone)), {
//           range: isSameStart ? 'end' : 'start',
//         });
//       }
//     }
//   });

//   return [mergedValue, setInnerValue, calendarValue, triggerCalendarChange] as const;
// }

export default function useFlexibleValue<DateType extends object = any>(
  info: Pick<
    RangePickerProps<DateType>,
    | 'generateConfig'
    | 'locale'
    | 'allowEmpty'
    | 'order'
    | 'onCalendarChange'
    | 'onChange'
    | 'picker'
  >,
  mergedValue: DateType,
  setInnerValue: (nextValue: DateType) => void,
  getCalendarValue: () => DateType,
  triggerCalendarChange: TriggerCalendarChange<DateType>,
  disabled: boolean,
  formatList: FormatType[],
  focused: boolean,
  open: boolean,
  isInvalidateDate: (date: DateType) => boolean,
): [
  /** Trigger `onChange` by check `disabledDate` */
  flushSubmit: (index: number, needTriggerChange: boolean) => void,
  /** Trigger `onChange` directly without check `disabledDate` */
  triggerSubmitChange: (value: DateType) => boolean,
] {
  const {
    // MISC
    generateConfig,
    locale,

    picker,

    onChange,

    // Checker
    allowEmpty,
    order,
  } = info;

  const orderOnChange = true;

  // ============================= Util =============================
  const [getDateTexts, isSameDates] = useUtil(generateConfig, locale, formatList);

  // ============================ Values ============================
  // Used for trigger `onChange` event.
  // Record current value which is wait for submit.
  const [innerSubmitValue, setSubmitValue] = useSyncState(mergedValue);
  const submitValue = React.useMemo<DateType[]>(() => {
    const filledValue = innerSubmitValue || EMPTY_VALUE;

    return Array.isArray(filledValue) ? filledValue : [filledValue];
  }, [innerSubmitValue]);

  /** Sync calendarValue & submitValue back with value */
  const syncWithValue = useEvent(() => {
    setSubmitValue(mergedValue);
  });

  React.useEffect(() => {
    syncWithValue();
  }, [mergedValue]);

  // ============================ Submit ============================
  const triggerSubmit = useEvent((nextValue?: DateType[]) => {
    const isNullValue = nextValue === null;

    const clone: DateType = [...(nextValue || submitValue())];

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
      (!end || !isInvalidateDate(end, { from: start }));

    // >>> Result
    const allPassed =
      // Null value is from clear button
      isNullValue ||
      // Normal check
      (validateEmptyDateRange && validateOrder && validateDates);

    if (allPassed) {
      // Sync value with submit value
      setInnerValue(clone);

      const [isSameMergedDates] = isSameDates(clone, mergedValue);

      // Trigger `onChange` if needed
      if (onChange && !isSameMergedDates) {
        onChange(
          // Return null directly if all date are empty
          isNullValue && clone.every((val) => !val) ? null : clone,
          getDateTexts(clone),
        );
      }
    }

    return allPassed;
  });

  // ========================= Flush Submit =========================
  const flushSubmit = useEvent((index: number, needTriggerChange: boolean) => {
    const nextSubmitValue = fillIndex(submitValue(), index, getCalendarValue()[index]);
    setSubmitValue(nextSubmitValue);

    if (needTriggerChange) {
      triggerSubmit();
    }
  });

  // ============================ Effect ============================
  // All finished action trigger after 2 frames
  const interactiveFinished = !focused && !open;

  useLockEffect(
    !interactiveFinished,
    () => {
      if (interactiveFinished) {
        // Always try to trigger submit first
        triggerSubmit();

        // Trigger calendar change since this is a effect reset
        // https://github.com/ant-design/ant-design/issues/22351
        triggerCalendarChange(mergedValue);

        // Sync with value anyway
        syncWithValue();
      }
    },
    2,
  );

  // ============================ Return ============================
  return [flushSubmit, triggerSubmit];
}

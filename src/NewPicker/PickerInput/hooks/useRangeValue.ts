import { useEvent, useMergedState } from 'rc-util';
import * as React from 'react';
import type { GenerateConfig } from '../../../generate';
import { formatValue, isSame, isSameTimestamp } from '../../../utils/dateUtil';
import useSyncState from '../../hooks/useSyncState';
import type { FormatType, Locale } from '../../interface';
import { fillIndex } from '../../util';
import type { RangePickerProps, RangeValueType } from '../RangePicker';
import useLockEffect from './useLockEffect';

const EMPTY_VALUE: [null, null] = [null, null];

// Submit Logic:
// * ✅ Value:
//    * merged value using controlled value, if not, use stateValue
//    * When merged value change, [1] resync calendar value and submit value
// * ✅ Calender Value:
//    * 💻 When user typing is validate, change the calendar value
//    * 🌅 When user click on the panel, change the calendar value
// * Submit Value:
//    * 💻 When user blur the input, flush calendar value to submit value
//    * 🌅 When user click on the panel is no needConfirm, flush calendar value to submit value
//    * 🌅 When user click on the panel is needConfirm and click OK, flush calendar value to submit value
// * Blur logic & close logic:
//    * ✅ For value, always try flush submit
//    * ✅ If `needConfirm`, reset as [1]
//    * Else (`!needConfirm`)
//      * If has another index field, active another index
// * ✅ Flush submit:
//    * If all the start & end field is confirmed or all blur or panel closed
//    * Update `needSubmit` mark to true
//    * trigger onChange by `needSubmit` and update stateValue

type TriggerCalendarChange<DateType> = ([start, end]: RangeValueType<DateType>) => void;

function useUtil<DateType extends object = any>(
  generateConfig: GenerateConfig<DateType>,
  locale: Locale,
  formatList: FormatType[],
) {
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

  return [getDateTexts, isSameDates] as const;
}

export function useInnerValue<DateType extends object = any>(
  generateConfig: GenerateConfig<DateType>,
  locale: Locale,
  formatList: FormatType[],
  defaultValue?: RangeValueType<DateType>,
  value?: RangeValueType<DateType>,
  onCalendarChange?: RangePickerProps<DateType>['onCalendarChange'],
) {
  // This is the root value which will sync with controlled or uncontrolled value
  const [innerValue, setInnerValue] = useMergedState(defaultValue, {
    value,
  });
  const mergedValue = innerValue || EMPTY_VALUE;

  // ========================= Inner Values =========================
  // Used for internal value management.
  // It should always use `mergedValue` in render logic
  const [calendarValue, setCalendarValue] = useSyncState(mergedValue);

  /** Sync calendarValue & submitValue back with value */
  const syncWithValue = useEvent(() => {
    setCalendarValue(mergedValue);
  });

  React.useEffect(() => {
    syncWithValue();
  }, [mergedValue]);

  // ============================ Change ============================
  const [getDateTexts, isSameDates] = useUtil(generateConfig, locale, formatList);

  const triggerCalendarChange: TriggerCalendarChange<DateType> = useEvent(([start, end]) => {
    const clone: RangeValueType<DateType> = [start, end];

    // Update merged value
    const [isSameMergedDates, isSameStart] = isSameDates(calendarValue(), clone);

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

  return [mergedValue, setInnerValue, calendarValue, triggerCalendarChange] as const;
}

export default function useRangeValue<DateType extends object = any>(
  info: Pick<
    RangePickerProps<DateType>,
    | 'generateConfig'
    | 'locale'
    | 'allowEmpty'
    | 'order'
    | 'onCalendarChange'
    | 'onChange'
    | 'preserveInvalidOnBlur'
    | 'picker'
  >,
  mergedValue: RangeValueType<DateType>,
  setInnerValue: (nextValue: RangeValueType<DateType>) => void,
  getCalendarValue: () => RangeValueType<DateType>,
  triggerCalendarChange: TriggerCalendarChange<DateType>,
  disabled: [boolean, boolean],
  formatList: FormatType[],
  focused: boolean,
  open: boolean,
  isInvalidateDate: (date: DateType) => boolean,
): [
  /** Trigger `onChange` by check `disabledDate` */
  flushSubmit: (index: number, needTriggerChange: boolean) => void,
  /** Trigger `onChange` directly without check `disabledDate` */
  triggerSubmitChange: (value: RangeValueType<DateType>) => boolean,
] {
  const {
    // MISC
    generateConfig,
    locale,

    picker,

    onChange,

    // Focus
    // preserveInvalidOnBlur,

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
  // Used for trigger `onChange` event.
  // Record current value which is wait for submit.
  const [submitValue, setSubmitValue] = useSyncState(mergedValue);

  /** Sync calendarValue & submitValue back with value */
  const syncWithValue = useEvent(() => {
    setSubmitValue(mergedValue);
  });

  React.useEffect(() => {
    syncWithValue();
  }, [mergedValue]);

  // ============================ Submit ============================
  const triggerSubmit = useEvent((nextValue?: RangeValueType<DateType>) => {
    const isNullValue = nextValue === null;

    const clone: RangeValueType<DateType> = [...(nextValue || submitValue())];

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

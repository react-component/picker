import { useEvent, useMergedState } from 'rc-util';
import * as React from 'react';
import type { GenerateConfig } from '../../../generate';
import { formatValue, isSame, isSameTimestamp } from '../../../utils/dateUtil';
import useSyncState from '../../hooks/useSyncState';
import type { BaseInfo, FormatType, Locale } from '../../interface';
import { fillIndex } from '../../util';
import type { RangePickerProps, RangeValueType } from '../RangePicker';
import useLockEffect from './useLockEffect';

const EMPTY_VALUE: any[] = [];

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

type TriggerCalendarChange<ValueType extends object[]> = (calendarValues: ValueType) => void;

type Replace2String<T> = {
  [P in keyof T]: string;
};

export function useUtil<
  MergedValueType extends object[],
  DateType extends MergedValueType[number] = any,
>(generateConfig: GenerateConfig<DateType>, locale: Locale, formatList: FormatType[]) {
  const getDateTexts = (dates: MergedValueType) => {
    return dates.map((date) =>
      formatValue(date, { generateConfig, locale, format: formatList[0] }),
    ) as any as Replace2String<Required<MergedValueType>>;
  };

  const isSameDates = (source: MergedValueType, target: MergedValueType) => {
    const maxLen = Math.max(source.length, target.length);
    let diffIndex = -1;

    for (let i = 0; i < maxLen; i += 1) {
      const prev = source[i] || null;
      const next = target[i] || null;

      if (prev !== next && !isSameTimestamp(generateConfig, prev, next)) {
        diffIndex = i;
        break;
      }
    }

    return [diffIndex < 0, diffIndex !== 0];
  };

  return [getDateTexts, isSameDates] as const;
}

/**
 * Used for internal value management.
 * It should always use `mergedValue` in render logic
 */
export function useCalendarValue<MergedValueType extends object[]>(mergedValue: MergedValueType) {
  const [calendarValue, setCalendarValue] = useSyncState(mergedValue);

  /** Sync calendarValue & submitValue back with value */
  const syncWithValue = useEvent(() => {
    setCalendarValue(mergedValue);
  });

  React.useEffect(() => {
    syncWithValue();
  }, [mergedValue]);

  return [calendarValue, setCalendarValue] as const;
}

export function useInnerValue<ValueType extends object[], DateType extends ValueType[number]>(
  generateConfig: GenerateConfig<DateType>,
  locale: Locale,
  formatList: FormatType[],
  defaultValue?: ValueType,
  value?: ValueType,
  onCalendarChange?: (
    dates: ValueType,
    dateStrings: Replace2String<Required<ValueType>>,
    info: BaseInfo,
  ) => void,
) {
  // This is the root value which will sync with controlled or uncontrolled value
  const [innerValue, setInnerValue] = useMergedState(defaultValue, {
    value,
  });
  const mergedValue = innerValue || (EMPTY_VALUE as ValueType);

  // ========================= Inner Values =========================
  const [calendarValue, setCalendarValue] = useCalendarValue(mergedValue);

  // ============================ Change ============================
  const [getDateTexts, isSameDates] = useUtil<ValueType>(generateConfig, locale, formatList);

  const triggerCalendarChange: TriggerCalendarChange<ValueType> = useEvent(
    (nextCalendarValues: ValueType) => {
      const clone = [...nextCalendarValues] as ValueType;

      // Update merged value
      const [isSameMergedDates, isSameStart] = isSameDates(calendarValue(), clone);

      if (!isSameMergedDates) {
        setCalendarValue(clone);

        // Trigger calendar change event
        if (onCalendarChange) {
          const cellTexts = getDateTexts(clone);
          onCalendarChange(clone, cellTexts, {
            range: isSameStart ? 'end' : 'start',
          });
        }
      }
    },
  );

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
    | 'picker'
  >,
  mergedValue: RangeValueType<DateType>,
  setInnerValue: (nextValue: RangeValueType<DateType>) => void,
  getCalendarValue: () => RangeValueType<DateType>,
  triggerCalendarChange: TriggerCalendarChange<RangeValueType<DateType>>,
  disabled: [boolean, boolean],
  formatList: FormatType[],
  focused: boolean,
  open: boolean,
  isInvalidateDate: (date: DateType, info?: { from?: DateType }) => boolean,
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

    // Checker
    allowEmpty,
    order,
  } = info;

  const orderOnChange = disabled.some((d) => d) ? false : order;

  // ============================= Util =============================
  const [getDateTexts, isSameDates] = useUtil<RangeValueType<DateType>>(
    generateConfig,
    locale,
    formatList,
  );

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

    const clone = [...(nextValue || submitValue())] as RangeValueType<DateType>;

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

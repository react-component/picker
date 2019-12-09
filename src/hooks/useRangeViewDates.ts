import * as React from 'react';
import { RangeValue, PickerMode } from '../interface';
import { GenerateConfig } from '../generate';
import { getValue, updateValues } from '../utils/miscUtil';
import {
  getClosingViewDate,
  isSameYear,
  isSameMonth,
  isSameDate,
} from '../utils/dateUtil';

function isClosingViewDate<DateType>(
  start: DateType | null,
  end: DateType | null,
  picker: PickerMode,
  generateConfig: GenerateConfig<DateType>,
) {
  // Skip when no compared
  if (!start || !end) {
    return true;
  }

  const startPrev = getClosingViewDate(start, picker, generateConfig, -1);
  const startNext = getClosingViewDate(start, picker, generateConfig, 1);

  function isSameCompare(compareFunc: (source: DateType | null) => boolean) {
    return [startPrev, start, startNext].some(date => compareFunc(date));
  }

  switch (picker) {
    case 'year':
      return isSameCompare(source => isSameYear(generateConfig, source, end));

    case 'month':
      return isSameCompare(source => isSameMonth(generateConfig, source, end));

    default:
      return isSameCompare(source => isSameDate(generateConfig, source, end));
  }
}

function getRangeViewDate<DateType>(
  values: RangeValue<DateType>,
  index: 0 | 1,
  picker: PickerMode,
  generateConfig: GenerateConfig<DateType>,
): DateType | null {
  const startDate = getValue(values, 0);
  const endDate = getValue(values, 1);

  if (index === 0) {
    return startDate;
  }

  if (endDate) {
    if (!isClosingViewDate(startDate, endDate, picker, generateConfig)) {
      return getClosingViewDate(endDate, picker, generateConfig, -1);
    }
    return endDate;
  }

  return null;
}

export default function useRangeViewDates<DateType>({
  values,
  picker,
  defaultDates,
  generateConfig,
}: {
  values: RangeValue<DateType>;
  picker: PickerMode;
  defaultDates: RangeValue<DateType> | undefined;
  generateConfig: GenerateConfig<DateType>;
}): [
  (activePickerIndex: 0 | 1) => DateType,
  (viewDate: DateType | null, index: 0 | 1) => void,
] {
  const [defaultViewDates, setDefaultViewDates] = React.useState<
    [DateType | null, DateType | null]
  >(() => [getValue(defaultDates, 0), getValue(defaultDates, 1)]);
  const [viewDates, setInternalViewDates] = React.useState<
    RangeValue<DateType>
  >(null);

  const startDate = getValue(values, 0);
  const endDate = getValue(values, 1);

  function getViewDate(index: 0 | 1): DateType {
    // If set default view date, use it
    if (defaultViewDates[index]) {
      return defaultViewDates[index]!;
    }

    return (
      getValue(viewDates, index) ||
      getRangeViewDate(values, index, picker, generateConfig) ||
      startDate ||
      endDate ||
      generateConfig.getNow()
    );
  }

  function setViewDate(viewDate: DateType | null, index: 0 | 1) {
    if (viewDate) {
      let newViewDates = updateValues(viewDates, viewDate, index);
      // Set view date will clean up default one
      setDefaultViewDates(
        // Should always be an array
        updateValues(defaultViewDates, null, index) || [null, null],
      );

      // Reset another one when not have value
      const anotherIndex = (index + 1) % 2;
      if (getValue(values, anotherIndex)) {
        newViewDates = updateValues(newViewDates, viewDate, anotherIndex);
      }

      setInternalViewDates(newViewDates);
    } else if (startDate || endDate) {
      // Reset all when has values when `viewDate` is `null` which means from open trigger
      setInternalViewDates(null);
    }
  }

  return [getViewDate, setViewDate];
}

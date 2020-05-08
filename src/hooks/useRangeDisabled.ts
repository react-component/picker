import * as React from 'react';
import { RangeValue, PickerMode, Locale } from '../interface';
import { getValue } from '../utils/miscUtil';
import { GenerateConfig } from '../generate';
import { isSameDate } from '../utils/dateUtil';
import useWeekDisabled from './useWeekDisabled';

export default function useRangeDisabled<DateType>({
  picker,
  locale,
  selectedValue,
  disabledDate,
  disabled,
  generateConfig,
  disabledPickerStartDate,
  disabledPickerEndDate,
}: {
  picker: PickerMode;
  selectedValue: RangeValue<DateType>;
  disabledDate?: (date: DateType) => boolean;
  disabled: [boolean, boolean];
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;
  disabledPickerStartDate?: (startDateToDisable: DateType) => boolean;
  disabledPickerEndDate?: (endDateToDisable: DateType) => boolean;
}) {
  const startDate = getValue(selectedValue, 0);
  const endDate = getValue(selectedValue, 1);

  const disabledStartDate = React.useCallback(
    (date: DateType) => {
      if (disabledPickerStartDate) {
        return disabledPickerStartDate(date);
      }
      if (disabledDate && disabledDate(date)) {
        return true;
      }

      if (disabled[1] && endDate) {
        return !isSameDate(generateConfig, date, endDate) && generateConfig.isAfter(date, endDate);
      }

      return false;
    },
    [disabledDate, disabled[1], endDate],
  );

  const disableEndDate = React.useCallback(
    (date: DateType) => {
      if (disabledPickerEndDate) {
        return disabledPickerEndDate(date);
      }
      if (disabledDate && disabledDate(date)) {
        return true;
      }

      if (startDate) {
        const compareStartDate =
          picker === 'week' ? generateConfig.addDate(startDate, -7) : startDate;

        return (
          !isSameDate(generateConfig, date, compareStartDate) &&
          generateConfig.isAfter(compareStartDate, date)
        );
      }

      return false;
    },
    [disabledDate, startDate, picker],
  );

  // Handle week date disabled
  const sharedWeekDisabledConfig = {
    generateConfig,
    locale,
  };

  const [disabledStartWeekDate] = useWeekDisabled({
    ...sharedWeekDisabledConfig,
    disabledDate: disabledStartDate,
  });
  const [disabledEndWeekDate] = useWeekDisabled({
    ...sharedWeekDisabledConfig,
    disabledDate: disableEndDate,
  });

  if (picker === 'week') {
    return [disabledStartWeekDate, disabledEndWeekDate];
  }

  return [disabledStartDate, disableEndDate];
}

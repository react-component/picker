import * as React from 'react';
import { RangeValue, PickerMode, Locale } from '../interface';
import { getValue } from '../utils/miscUtil';
import { GenerateConfig } from '../generate';
import { isSameDate, getQuarter } from '../utils/dateUtil';

export default function useRangeDisabled<DateType>({
  picker,
  locale,
  selectedValue,
  disabledDate,
  disabled,
  generateConfig,
}: {
  picker: PickerMode;
  selectedValue: RangeValue<DateType>;
  disabledDate?: (date: DateType) => boolean;
  disabled: [boolean, boolean];
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;
}) {
  const startDate = getValue(selectedValue, 0);
  const endDate = getValue(selectedValue, 1);

  const disabledStartDate = React.useCallback(
    (date: DateType) => {
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
      if (disabledDate && disabledDate(date)) {
        return true;
      }

      if (startDate) {
        if (picker === 'week') {
          const startYear = generateConfig.getYear(startDate);
          const dateYear = generateConfig.getYear(date);
          const startWeek = generateConfig.locale.getWeek(locale.locale, startDate);
          const dateWeek = generateConfig.locale.getWeek(locale.locale, date);
          const startVal = startYear * 100 + startWeek;
          const dateVal = dateYear * 100 + dateWeek;
          return dateVal < startVal;
        }

        if (picker === 'quarter') {
          const startYear = generateConfig.getYear(startDate);
          const dateYear = generateConfig.getYear(date);
          const startQuarter = getQuarter(generateConfig, startDate);
          const dateQuarter = getQuarter(generateConfig, date);
          const startVal = startYear * 10 + startQuarter;
          const dateVal = dateYear * 10 + dateQuarter;
          return dateVal < startVal;
        }

        return (
          !isSameDate(generateConfig, date, startDate) && generateConfig.isAfter(startDate, date)
        );
      }

      return false;
    },
    [disabledDate, startDate, picker],
  );

  return [disabledStartDate, disableEndDate];
}

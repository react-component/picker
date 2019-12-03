import { RangeValue } from '../interface';
import { getValue } from '../utils/miscUtil';
import { GenerateConfig } from '../generate';
import { isSameDate } from '../utils/dateUtil';

export default function useRangeDisabled<DateType>({
  selectedValue,
  disabledDate,
  disabled,
  generateConfig,
}: {
  selectedValue: RangeValue<DateType>;
  disabledDate?: (date: DateType) => boolean;
  disabled: [boolean, boolean];
  generateConfig: GenerateConfig<DateType>;
}) {
  const startDate = getValue(selectedValue, 0);
  const endDate = getValue(selectedValue, 1);

  function disabledStartDate(date: DateType) {
    if (disabledDate && disabledDate(date)) {
      return true;
    }

    if (disabled[1] && endDate) {
      return (
        !isSameDate(generateConfig, date, endDate) &&
        generateConfig.isAfter(date, endDate)
      );
    }

    return false;
  }

  function disableEndDate(date: DateType) {
    if (disabledDate && disabledDate(date)) {
      return true;
    }

    if (startDate) {
      return (
        !isSameDate(generateConfig, date, startDate) &&
        generateConfig.isAfter(startDate, date)
      );
    }

    return false;
  }

  return [disabledStartDate, disableEndDate];
}

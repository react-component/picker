import type { GenerateConfig } from '../../../generate';
import { isSame } from '../../../utils/dateUtil';
import type { DisabledDate, Locale } from '../../interface';
import type { RangeValueType } from '../RangePicker';

export default function useRangeDisabledDate<DateType = any>(
  values: RangeValueType<DateType>,
  disabled: [boolean, boolean],
  activeIndex: number,
  generateConfig: GenerateConfig<DateType>,
  locale: Locale,
  disabledDate?: DisabledDate<DateType>,
) {
  const rangeDisabledDate: DisabledDate<DateType> = (date, info) => {
    const [start, end] = values;

    // Should not select days before the start date
    if (
      activeIndex === 1 &&
      disabled[0] &&
      start &&
      // Same date isOK
      !isSame(generateConfig, locale, start, date, info.type) &&
      // Before start date
      generateConfig.isAfter(start, date)
    ) {
      return true;
    }

    // Should not select days after the end date
    if (
      activeIndex === 0 &&
      disabled[1] &&
      end &&
      // Same date isOK
      !isSame(generateConfig, locale, end, date, info.type) &&
      // After end date
      generateConfig.isAfter(date, end)
    ) {
      return true;
    }

    return disabledDate?.(date, info);
  };

  return rangeDisabledDate;
}
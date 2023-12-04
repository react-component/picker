import type { GenerateConfig } from '../../../generate';
import { isSame } from '../../../utils/dateUtil';
import type { DisabledDate, Locale } from '../../interface';
import type { RangeValueType } from '../RangePicker';

export default function useRangeDisabledDate<DateType extends object = any>(
  values: RangeValueType<DateType>,
  disabled: [boolean, boolean],
  activeIndexList: number[],
  generateConfig: GenerateConfig<DateType>,
  locale: Locale,
  disabledDate?: DisabledDate<DateType>,
) {
  const activeIndex = activeIndexList[activeIndexList.length - 1];
  const firstValuedIndex = activeIndexList.find((index) => values[index]);

  const rangeDisabledDate: DisabledDate<DateType> = (date, info) => {
    const [start, end] = values;

    const mergedInfo = {
      ...info,
      from: activeIndex !== firstValuedIndex ? values[firstValuedIndex] : undefined,
    };

    // ============================ Disabled ============================
    // Should not select days before the start date
    if (
      activeIndex === 1 &&
      disabled[0] &&
      start &&
      // Same date isOK
      !isSame(generateConfig, locale, start, date, mergedInfo.type) &&
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
      !isSame(generateConfig, locale, end, date, mergedInfo.type) &&
      // After end date
      generateConfig.isAfter(date, end)
    ) {
      return true;
    }

    // =========================== Min or Max ===========================
    // const limitInfo = {
    //   from: activeIndex !== firstValuedIndex ? values[firstValuedIndex] : undefined,
    // };
    // const mergedMinDate = typeof minDate === 'function' ? minDate(limitInfo) : minDate;
    // const mergedMaxDate = typeof maxDate === 'function' ? maxDate(limitInfo) : maxDate;

    // if (
    //   mergedMinDate &&
    //   generateConfig.isAfter(mergedMinDate, date) &&
    //   !isSame(generateConfig, locale, mergedMinDate, date, info.type)
    // ) {
    //   return true;
    // }

    // if (
    //   mergedMaxDate &&
    //   generateConfig.isAfter(date, mergedMaxDate) &&
    //   !isSame(generateConfig, locale, mergedMaxDate, date, info.type)
    // ) {
    //   return true;
    // }

    // TODO: Select Range then select the date after end date

    // ============================= Origin =============================
    return disabledDate?.(date, mergedInfo);
  };

  return rangeDisabledDate;
}

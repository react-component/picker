import type { GenerateConfig } from '../../../generate';
import { isSame } from '../../../utils/dateUtil';
import type { InternalMode, LimitDate, Locale } from '../../interface';

export type IsInvalidBoundary<DateType> = (
  currentDate: DateType,
  type: InternalMode,
  fromDate?: DateType,
) => boolean;

export default function useDisabledBoundary<DateType extends object = any>(
  generateConfig: GenerateConfig<DateType>,
  locale: Locale,
  minDate?: LimitDate<DateType>,
  maxDate?: LimitDate<DateType>,
): IsInvalidBoundary<DateType> {
  const isInValidBoundary: IsInvalidBoundary<DateType> = (date, type, from) => {
    const toBoundaryDate = (boundary?: LimitDate<DateType>) =>
      typeof boundary === 'function'
        ? boundary({
            from,
          })
        : boundary;

    const mergedMinDate = toBoundaryDate(minDate);
    const mergedMaxDate = toBoundaryDate(maxDate);

    if (
      mergedMinDate &&
      generateConfig.isAfter(mergedMinDate, date) &&
      !isSame(generateConfig, locale, mergedMinDate, date, type)
    ) {
      return true;
    }

    if (
      mergedMaxDate &&
      generateConfig.isAfter(date, mergedMaxDate) &&
      !isSame(generateConfig, locale, mergedMaxDate, date, type)
    ) {
      return true;
    }

    return false;
  };

  return isInValidBoundary;
}

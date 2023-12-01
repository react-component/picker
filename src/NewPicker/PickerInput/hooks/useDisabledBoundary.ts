import { useEvent } from 'rc-util';
import type { GenerateConfig } from '../../../generate';
import { isSame } from '../../../utils/dateUtil';
import type { DisabledDate, InternalMode, LimitDate, Locale } from '../../interface';

export type IsInvalidBoundary<DateType> = (
  currentDate: DateType,
  type: InternalMode,
  fromDate?: DateType,
) => boolean;

/**
 * Merge `disabledDate` with `minDate` & `maxDate`.
 */
export default function useDisabledBoundary<DateType extends object = any>(
  generateConfig: GenerateConfig<DateType>,
  locale: Locale,
  disabledDate?: DisabledDate<DateType>,
  minDate?: LimitDate<DateType>,
  maxDate?: LimitDate<DateType>,
) {
  const mergedDisabledDate = useEvent<DisabledDate<DateType>>((date, info) => {
    if (disabledDate && disabledDate(date, info)) {
      return true;
    }

    return false;
  });

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

  return mergedDisabledDate;
}

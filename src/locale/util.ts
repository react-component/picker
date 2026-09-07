import type { GenerateConfig } from '../generate';
import type { Locale } from '../interface';
import { formatValue } from '../utils/dateUtil';

function getCalendarFallback<DateType>(locale: Locale, generateConfig: GenerateConfig<DateType>) {
  return generateConfig.locale.isLocaleAvailable?.(locale.locale) === false
    ? locale.calendarFallback
    : undefined;
}

export function getShortMonths<DateType>(locale: Locale, generateConfig: GenerateConfig<DateType>) {
  return (
    locale.shortMonths ??
    getCalendarFallback(locale, generateConfig)?.shortMonths ??
    generateConfig.locale.getShortMonths?.(locale.locale) ??
    []
  );
}

export function getShortWeekDays<DateType>(
  locale: Locale,
  generateConfig: GenerateConfig<DateType>,
) {
  return (
    locale.shortWeekDays ??
    getCalendarFallback(locale, generateConfig)?.shortWeekDays ??
    generateConfig.locale.getShortWeekDays?.(locale.locale) ??
    []
  );
}

export function getMonthText<DateType>(
  locale: Locale,
  generateConfig: GenerateConfig<DateType>,
  value: DateType,
) {
  const month = generateConfig.getMonth(value);

  if (locale.monthFormat) {
    const fallback = getCalendarFallback(locale, generateConfig);
    const months =
      locale.monthFormat === 'MMMM'
        ? fallback?.months
        : locale.monthFormat === 'MMM'
          ? fallback?.shortMonths
          : undefined;

    return months
      ? months[month]
      : formatValue(value, { locale, generateConfig, format: locale.monthFormat });
  }

  return getShortMonths(locale, generateConfig)[month];
}

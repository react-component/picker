import {
  addDays,
  addMonths,
  addYears,
  endOfMonth,
  format as formatDate,
  getDate,
  getDay,
  getHours,
  getMinutes,
  getMonth,
  getSeconds,
  getWeek,
  getYear,
  isAfter,
  isValid,
  parse as parseDate,
  setDate,
  setHours,
  setMilliseconds,
  setMinutes,
  setMonth,
  setSeconds,
  setYear,
  startOfWeek,
  getMilliseconds,
  type Locale,
} from 'date-fns';
import * as locales from 'date-fns/locale';
import type { GenerateConfig } from '.';

const getLocale = (locale: string): Locale => {
  return (
    locales[locale] || locales[locale.replace(/_/g, '')] || locales[locale.replace(/_.*$/g, '')]
  );
};

const localeParse = (format: string) => {
  return format
    .replace(/Y/g, 'y')
    .replace(/D/g, 'd')
    .replace(/gggg/, 'yyyy')
    .replace(/g/g, 'G')
    .replace(/([Ww])o/g, 'wo');
};

const parse = (text: string, format: string, locale: string) => {
  return parseDate(text, localeParse(format), new Date(), { locale: getLocale(locale) });
}

/**
 * Check if the text is a valid date considering the format and locale
 *
 * This is a strict check, the date string must match the format exactly.
 * Date-fns allows some flexibility in parsing dates, for example, it will parse "30/01/2" as "30/01/002".
 * This behavior is not desirable in our case, so we need to check if the date string matches the format exactly.
 *
 * @param text the date string
 * @param format the date format to use
 * @param locale the locale to use
 */
const isStrictValidDate = (text: string, format: string, locale: string) => {
  const date = parse(text, format, locale);
  if (!isValid(date)) {
    return false;
  }
  const formattedDate = formatDate(date, format, { locale: getLocale(locale) });
  return text === formattedDate;
}

const generateConfig: GenerateConfig<Date> = {
  // get
  getNow: () => new Date(),
  getFixedDate: (string) => new Date(string),
  getEndDate: (date) => endOfMonth(date),
  getWeekDay: (date) => getDay(date),
  getYear: (date) => getYear(date),
  getMonth: (date) => getMonth(date),
  getDate: (date) => getDate(date),
  getHour: (date) => getHours(date),
  getMinute: (date) => getMinutes(date),
  getSecond: (date) => getSeconds(date),
  getMillisecond: (date) => getMilliseconds(date),

  // set
  addYear: (date, diff) => addYears(date, diff),
  addMonth: (date, diff) => addMonths(date, diff),
  addDate: (date, diff) => addDays(date, diff),
  setYear: (date, year) => setYear(date, year),
  setMonth: (date, month) => setMonth(date, month),
  setDate: (date, num) => setDate(date, num),
  setHour: (date, hour) => setHours(date, hour),
  setMinute: (date, minute) => setMinutes(date, minute),
  setSecond: (date, second) => setSeconds(date, second),
  setMillisecond: (date, millisecond) => setMilliseconds(date, millisecond),

  // Compare
  isAfter: (date1, date2) => isAfter(date1, date2),
  isValidate: (date) => isValid(date),

  locale: {
    getWeekFirstDay: (locale) => {
      const clone = getLocale(locale);
      return clone.options.weekStartsOn;
    },
    getWeekFirstDate: (locale, date) => {
      return startOfWeek(date, { locale: getLocale(locale) });
    },
    getWeek: (locale, date) => {
      return getWeek(date, { locale: getLocale(locale) });
    },
    getShortWeekDays: (locale) => {
      const clone = getLocale(locale);
      return Array.from({ length: 7 }).map((_, i) => clone.localize.day(i, { width: 'short' }));
    },
    getShortMonths: (locale) => {
      const clone = getLocale(locale);
      return Array.from({ length: 12 }).map((_, i) =>
        clone.localize.month(i, { width: 'abbreviated' }),
      );
    },
    format: (locale, date, format) => {
      if (!isValid(date)) {
        return null;
      }
      return formatDate(date, localeParse(format), {
        locale: getLocale(locale),
      });
    },
    parse: (locale, text, formats) => {
      for (let i = 0; i < formats.length; i += 1) {
        const format = localeParse(formats[i]);

        if (isStrictValidDate(text, format, locale)) {
          return parse(text, format, locale);
        }
      }
      return null;
    },
  },
};

export default generateConfig;

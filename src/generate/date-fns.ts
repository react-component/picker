/* eslint-disable */
import { noteOnce } from 'rc-util/lib/warning';
import {
  getYear,
  getMonth,
  getDate,
  getHours,
  getMinutes,
  getSeconds,
  addYears,
  addMonths,
  addDays,
  setYear,
  setMonth,
  setDate,
  setHours,
  setMinutes,
  setSeconds,
  isAfter,
  isValid,
  getDay,
  format,
  parse,
  getWeek,
  addWeeks,
  startOfWeek,
} from 'date-fns';

import { enUS, zhCN, zhTW, enGB } from 'date-fns/locale';

import { GenerateConfig } from '.';

// hack for zh_CN and zh_TW week display
function chineseLocalizeReplace(fn: Locale['localize']['ordinalNumber']) {
  return (dirtyNumber: string, dirtyOptions: { unit?: any }) => {
    const unit = String(dirtyOptions.unit);
    if (unit === 'week') {
      return `${+dirtyNumber}周`;
    } else {
      return fn(dirtyNumber, dirtyOptions);
    }
  };
}

const localeMap = {
  en_GB: enGB,
  en_US: enUS,
  zh_CN: {
    ...zhCN,
    localize: {
      ...zhCN.localize,
      ordinalNumber: chineseLocalizeReplace(zhCN.localize.ordinalNumber),
    },
  },
  zh_TW: {
    ...zhTW,
    localize: {
      ...zhTW.localize,
      ordinalNumber: chineseLocalizeReplace(zhTW.localize.ordinalNumber),
    },
  },
};

const parseLocale = function parseLocale(locale: string) {
  const mapLocale = localeMap[locale as keyof typeof localeMap];
  return mapLocale;
};

const parseFormat = (format: string) => {
  return format
    .replace(/Y/g, 'y')
    .replace(/D/g, 'd')
    .replace(/gggg/, 'yyyy')
    .replace(/g/g, 'G')
    .replace(/([Ww])o/g, 'wo');
};

const config: GenerateConfig<Date> = {
  getNow() {
    return new Date();
  },
  getWeekDay(date) {
    return getDay(date);
  },
  getYear,
  getMonth,
  getDate,
  getHour: getHours,
  getMinute: getMinutes,
  getSecond: getSeconds,
  addYear: addYears,
  addMonth: addMonths,
  addDate: addDays,
  setYear,
  setMonth,
  setDate,
  setHour: setHours,
  setMinute: setMinutes,
  setSecond: setSeconds,
  isAfter,
  isValidate: isValid,
  locale: {
    getWeekFirstDay(locale) {
      return getDay(startOfWeek(new Date(), { locale: parseLocale(locale) }));
    },
    getWeek(locale, date) {
      return getWeek(date, { locale: parseLocale(locale) });
    },
    format(locale, date, _format) {
      return format(date, parseFormat(_format), { locale: parseLocale(locale) });
    },
    getShortMonths(locale) {
      return Array.from({ length: 12 }, (_, i) =>
        parseLocale(locale).localize!.month(i, { width: 'abbreviated' }),
      );
    },
    getShortWeekDays(locale) {
      return Array.from({ length: 7 }, (_, i) =>
        parseLocale(locale).localize!.day(i, { width: 'short' }),
      );
    },
    parse(locale, text, formats) {
      for (let _format of formats) {
        let formatText = text;
        let _formatSpec = parseFormat(_format);
        if (/[Ww]o/g.test(_format)) {
          const year = formatText.split('-')[0];
          const weekStr = formatText.split('-')[1];
          const weekCal = parse(year, 'yyyy', new Date(), {
            locale: parseLocale(locale),
          });
          if (isValid(weekCal)) {
            let i = 1;
            do {
              const result = addWeeks(weekCal, i);
              if (format(result, 'wo', { locale: parseLocale(locale) }) === weekStr) {
                return result;
              }
            } while (52 - i++);
          }
        }

        const date = parse(formatText, _formatSpec, new Date(), { locale: parseLocale(locale) });
        if (isValid(date)) {
          return date;
        }
      }
      noteOnce(
        false,
        'Not match any format strictly and fallback to fuzzy match. Please help to fire a issue about this.',
      );
      return null;
    },
  },
};

export default config;

import {
  getDay,
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
  getWeek,
  format as formatDate,
  parse as parseDate,
} from 'date-fns';
import * as Locale from 'date-fns/locale';
import { GenerateConfig } from '.';

const dealLocal = (str: string) => {
  return str.replace(/_/g, '');
};

const generateConfig: GenerateConfig<Date> = {
  // get
  getNow: () => new Date(),
  getWeekDay: date => getDay(date),
  getYear: date => getYear(date),
  getMonth: date => getMonth(date),
  getDate: date => getDate(date),
  getHour: date => getHours(date),
  getMinute: date => getMinutes(date),
  getSecond: date => getSeconds(date),

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

  // Compare
  isAfter: (date1, date2) => isAfter(date1, date2),
  isValidate: date => isValid(date),

  locale: {
    getWeekFirstDay: locale => {
      const clone = Locale[dealLocal(locale)];
      return clone.options.weekStartsOn;
    },
    getWeek: (locale, date) => {
      return getWeek(date, { locale: Locale[dealLocal(locale)] });
    },
    format: (locale, date, format) => {
      if (!isValid(date)) {
        return null;
      }
      return formatDate(date, format, { locale: Locale[dealLocal(locale)] });
    },
    parse: (locale, text, formats) => {
      for (let i = 0; i < formats.length; i += 1) {
        const format = formats[i];
        const formatText = text;
        const date = parseDate(formatText, format, new Date(), {
          locale: Locale[dealLocal(locale)],
        });
        if (isValid(date)) {
          return date;
        }
      }
      return null;
    },
  },
};

export default generateConfig;

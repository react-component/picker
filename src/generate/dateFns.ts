import dateFns from 'date-fns';
import Locale from 'date-fns/locale';
import { GenerateConfig } from '.';

const generateConfig: GenerateConfig<Date | number> = {
  // get
  getNow: () => new Date(),
  getWeekDay: date => dateFns.getDay(date),
  getYear: date => dateFns.getYear(date),
  getMonth: date => dateFns.getMonth(date),
  getDate: date => dateFns.getDate(date),
  getHour: date => dateFns.getHours(date),
  getMinute: date => dateFns.getMinutes(date),
  getSecond: date => dateFns.getSeconds(date),

  // set
  addYear: (date, diff) => dateFns.addYears(date, diff),
  addMonth: (date, diff) => dateFns.addMonths(date, diff),
  addDate: (date, diff) => dateFns.addDays(date, diff),
  setYear: (date, year) => dateFns.setYear(date, year),
  setMonth: (date, month) => dateFns.setMonth(date, month),
  setDate: (date, num) => dateFns.setDate(date, num),
  setHour: (date, hour) => dateFns.setHours(date, hour),
  setMinute: (date, minute) => dateFns.setMinutes(date, minute),
  setSecond: (date, second) => dateFns.setSeconds(date, second),

  // Compare
  isAfter: (date1, date2) => dateFns.isAfter(date1, date2),
  isValidate: date => dateFns.isValid(date),

  locale: {
    getWeekFirstDay: locale => {
      const clone = Locale[locale];
      return clone.options.weekStartsOn;
    },
    getWeek: (locale, date) => {
      return dateFns.getWeek(date, { locale: Locale[locale] });
    },
    format: (locale, date, format) => {
      return dateFns.format(date, format, { locale: Locale[locale] });
    },
    parse: () => {
      return null;
    },
  },
};

export default generateConfig;

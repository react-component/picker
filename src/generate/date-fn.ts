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
  setDay,
  format,
  parse,
  toDate,
} from 'date-fns';

import { GenerateConfig } from '.';

const localeMap = {
  en_GB: 'en-gb',
  en_US: 'en',
  zh_CN: 'zh-cn',
  zh_TW: 'zh-tw',
};

const parseLocale = function parseLocale(locale: string) {
  const mapLocale = localeMap[locale];
  return mapLocale || locale.split('_')[0];
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
      return getDay(setDay(new Date(new Date().toLocaleDateString(locale)), 1));
    },
    getWeek(locale, date) {
      return getDay(new Date(new Date(date).toLocaleDateString(locale)));
    },
    format(locale, date, _format) {
      return format(new Date(date.toLocaleDateString(locale)), _format);
    },
    parse(locale, text, formats) {
      const fallbackFormatList: string[] = [];
      for (let _format of formats) {
        let formatText = text;
        if (/[Ww]o/g.test(_format)) {
          _format = _format.replace(/wo/g, 'w').replace(/Wo/g, 'W');
          const matchFormat = _format.match(/[-YyMmDdHhSsWwGg]+/g);
          const matchText = formatText.match(/[-\d]+/g);
          if (matchFormat && matchText) {
            _format = matchFormat.join('');
            formatText = matchText.join('');
          } else {
            fallbackFormatList.push(_format.replace(/o/g, ''));
          }
        }

        const date = format(new Date(formatText), _format, { locale: { code: locale } });
        if (isValid(date)) {
          return new Date(new Date(formatText).toLocaleDateString(locale));
        }
      }
      return null;
    },
  },
};

export default config;

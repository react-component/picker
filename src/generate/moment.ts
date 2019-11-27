import moment, { Moment } from 'moment';
import { noteOnce } from 'rc-util/lib/warning';
import { GenerateConfig } from '.';

const generateConfig: GenerateConfig<Moment> = {
  // get
  getNow: () => moment(),
  getWeekDay: date => date.weekday(),
  getYear: date => date.year(),
  getMonth: date => date.month(),
  getDate: date => date.date(),
  getHour: date => date.hour(),
  getMinute: date => date.minute(),
  getSecond: date => date.second(),

  // set
  addYear: (date, diff) => {
    const clone = date.clone();
    clone.add(diff, 'year');
    return clone;
  },
  addMonth: (date, diff) => {
    const clone = date.clone();
    clone.add(diff, 'month');
    return clone;
  },
  addDate: (date, diff) => {
    const clone = date.clone();
    clone.add(diff, 'day');
    return clone;
  },
  setYear: (date, year) => {
    const clone = date.clone();
    clone.year(year);
    return clone;
  },
  setMonth: (date, month) => {
    const clone = date.clone();
    clone.month(month);
    return clone;
  },
  setDate: (date, num) => {
    const clone = date.clone();
    clone.date(num);
    return clone;
  },
  setHour: (date, hour) => {
    const clone = date.clone();
    clone.hour(hour);
    return clone;
  },
  setMinute: (date, minute) => {
    const clone = date.clone();
    clone.minute(minute);
    return clone;
  },
  setSecond: (date, second) => {
    const clone = date.clone();
    clone.second(second);
    return clone;
  },

  // Compare
  isAfter: (date1, date2) => date1.isAfter(date2),

  locale: {
    getWeekFirstDay: locale => {
      const date = moment().locale(locale);
      return date.localeData().firstDayOfWeek();
    },
    getWeek: (locale, date) => {
      const clone = date.clone();
      clone.locale(locale);
      return clone.week();
    },
    getShortWeekDays: locale => {
      const date = moment().locale(locale);
      return date.localeData().weekdaysMin();
    },
    getShortMonths: locale => {
      const date = moment().locale(locale);
      return date.localeData().monthsShort();
    },
    format: (locale, date, format) => {
      const clone = date.clone();
      clone.locale(locale);
      return clone.format(format);
    },
    parse: (locale, text, formats) => {
      const fallbackFormatList: string[] = [];

      for (let i = 0; i < formats.length; i += 1) {
        let format = formats[i];
        let formatText = text;

        if (format.includes('o')) {
          const matchFormat = format.match(/[YyMmDdHhSsWw]+/g);
          const matchText = formatText.match(/\d+/g);

          if (matchFormat && matchText) {
            format = matchFormat.join('');
            formatText = matchText.join('');
          } else {
            fallbackFormatList.push(format.replace(/o/g, ''));
          }
        }

        const date = moment(formatText, format, locale, true);
        if (date.isValid()) {
          return date;
        }
      }

      // Fallback to fuzzy matching, this should always not reach match or need fire a issue
      for (let i = 0; i < fallbackFormatList.length; i += 1) {
        const date = moment(text, fallbackFormatList[i], locale, false);

        /* istanbul ignore next */
        if (date.isValid()) {
          noteOnce(
            false,
            'Not match any format strictly and fallback to fuzzy match. Please help to fire a issue about this.',
          );
          return date;
        }
      }

      return null;
    },
  },
};

export default generateConfig;

import dayjs, { Dayjs } from 'dayjs';
import { noteOnce } from 'rc-util/lib/warning';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { GenerateConfig } from '.';

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);

dayjs.extend((o, c) => {
  // todo support Wo (ISO week)
  const proto = c.prototype;
  const oldFormat = proto.format;
  proto.format = function f(formatStr: string) {
    const str = formatStr.replace('Wo', 'wo');
    return oldFormat.bind(this)(str);
  };
});

type IlocaleMapObject = { [key: string]: string };
const localeMap: IlocaleMapObject = {
  en_GB: 'en-gb',
  en_US: 'en',
  zh_CN: 'zh-cn',
  zh_TW: 'zh-tw',
};

const parseLocale = (locale: string) => {
  const mapLocale = localeMap[locale];
  return mapLocale || locale.split('_')[0];
};

const generateConfig: GenerateConfig<Dayjs> = {
  // get
  getNow: () => dayjs(),
  getWeekDay: date => date.weekday(),
  getYear: date => date.year(),
  getMonth: date => date.month(),
  getDate: date => date.date(),
  getHour: date => date.hour(),
  getMinute: date => date.minute(),
  getSecond: date => date.second(),

  // set
  addYear: (date, diff) => date.add(diff, 'year'),
  addMonth: (date, diff) => date.add(diff, 'month'),
  addDate: (date, diff) => date.add(diff, 'day'),
  setYear: (date, year) => date.year(year),
  setMonth: (date, month) => date.month(month),
  setDate: (date, num) => date.date(num),
  setHour: (date, hour) => date.hour(hour),
  setMinute: (date, minute) => date.minute(minute),
  setSecond: (date, second) => date.second(second),

  // Compare
  isAfter: (date1, date2) => date1.isAfter(date2),
  isValidate: date => date.isValid(),

  locale: {
    getWeekFirstDay: locale =>
      dayjs()
        .locale(parseLocale(locale))
        .localeData()
        .firstDayOfWeek(),
    getWeek: (locale, date) => date.locale(parseLocale(locale)).week(),
    getShortWeekDays: locale =>
      dayjs()
        .locale(parseLocale(locale))
        .localeData()
        .weekdaysMin(),
    getShortMonths: locale =>
      dayjs()
        .locale(parseLocale(locale))
        .localeData()
        .monthsShort(),
    format: (locale, date, format) =>
      date.locale(parseLocale(locale)).format(format),
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

        const date = dayjs(formatText, format, parseLocale(locale));
        if (date.isValid()) {
          return date;
        }
      }

      // Fallback to fuzzy matching, this should always not reach match or need fire a issue
      for (let i = 0; i < fallbackFormatList.length; i += 1) {
        const date = dayjs(text, fallbackFormatList[i], parseLocale(locale));

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

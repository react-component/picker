import type {
  Locale
} from 'date-fns';
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
} from 'date-fns';
import {
  ar,
  az,
  bg,
  ca,
  cs,
  da,
  de,
  el,
  enGB,
  enUS,
  es,
  et,
  faIR,
  fi,
  fr,
  frCA,
  gl,
  he,
  hi,
  hr,
  hu,
  hy,
  id,
  is,
  it,
  ja,
  kn,
  kk,
  ko,
  lt,
  lv,
  mk,
  mn,
  ms,
  nb,
  nlBE,
  nl,
  pl,
  ptBR,
  pt,
  ro,
  ru,
  sk,
  sr,
  sl,
  sv,
  ta,
  th,
  tr,
  uk,
  vi,
  zhCN,
  zhTW,
} from 'date-fns/locale';
import type { GenerateConfig } from '.';

const LocaleMap: Record<string, Locale> = {
  ar_EG: ar,
  az_AZ: az,
  bg_BG: bg,
  // by_BY: by,
  ca_ES: ca,
  cs_CZ: cs,
  da_DK: da,
  de_DE: de,
  el_GR: el,
  en_GB: enGB,
  en_US: enUS,
  es_ES: es,
  et_EE: et,
  fa_IR: faIR,
  fi_FI: fi,
  fr_BE: fr,
  fr_CA: frCA,
  fr_FR: fr,
  // ga_IE: ga,
  gl_ES: gl,
  he_IL: he,
  hi_IN: hi,
  hr_HR: hr,
  hu_HU: hu,
  hy_AM: hy,
  id_ID: id,
  it_IT: it,
  is_IS: is,
  ja_JP: ja,
  // kmr_IQ: kmr,
  kn_IN: kn,
  kk_KZ: kk,
  ko_KR: ko,
  lt_LT: lt,
  lv_LV: lv,
  mk_MK: mk,
  mn_MN: mn,
  ms_MY: ms,
  nb_NO: nb,
  // ne_NP: ne,
  nl_BE: nlBE,
  nl_NL: nl,
  pl_PL: pl,
  pt_BR: ptBR,
  pt_PT: pt,
  ro_RO: ro,
  ru_RU: ru,
  sk_SK: sk,
  sr_RS: sr,
  sl_SI: sl,
  sv_SE: sv,
  ta_IN: ta,
  th_TH: th,
  tr_TR: tr,
  uk_UA: uk,
  vi_VN: vi,
  zh_CN: zhCN,
  zh_HK: zhCN,
  zh_TW: zhTW,
};

const localeParse = (format: string) => {
  return format
    .replace(/Y/g, 'y')
    .replace(/D/g, 'd')
    .replace(/gggg/, 'yyyy')
    .replace(/g/g, 'G')
    .replace(/([Ww])o/g, 'wo');
};

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
  getMillisecond: (date) => date.getMilliseconds(),

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
      return LocaleMap[locale].options.weekStartsOn;
    },
    getWeekFirstDate: (locale, date) => {
      return startOfWeek(date, { locale: LocaleMap[locale] });
    },
    getWeek: (locale, date) => {
      return getWeek(date, { locale: LocaleMap[locale] });
    },
    getShortWeekDays: (locale) => {
      return Array.from({ length: 7 }).map((_, i) =>
        LocaleMap[locale].localize.day(i, { width: 'short' }),
      );
    },
    getShortMonths: (locale) => {
      return Array.from({ length: 12 }).map((_, i) =>
        LocaleMap[locale].localize.month(i, { width: 'abbreviated' }),
      );
    },
    format: (locale, date, format) => {
      if (!isValid(date)) {
        return null;
      }
      return formatDate(date, localeParse(format), {
        locale: LocaleMap[locale],
      });
    },
    parse: (locale, text, formats) => {
      for (let i = 0; i < formats.length; i += 1) {
        const format = localeParse(formats[i]);
        const formatText = text;
        const date = parseDate(formatText, format, new Date(), {
          locale: LocaleMap[locale],
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

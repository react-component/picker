export interface GenerateConfig<DateType> {
  // Get
  getWeekDay: (value: DateType) => number;
  getSecond: (value: DateType) => number;
  getMinute: (value: DateType) => number;
  getHour: (value: DateType) => number;
  getDate: (value: DateType) => number;
  getMonth: (value: DateType) => number;
  getYear: (value: DateType) => number;
  getNow: () => DateType;

  // Set
  addYear: (value: DateType, diff: number) => DateType;
  addMonth: (value: DateType, diff: number) => DateType;
  addDate: (value: DateType, diff: number) => DateType;
  setYear: (value: DateType, year: number) => DateType;
  setMonth: (value: DateType, month: number) => DateType;
  setDate: (value: DateType, date: number) => DateType;
  setHour: (value: DateType, hour: number) => DateType;
  setMinute: (value: DateType, minute: number) => DateType;
  setSecond: (value: DateType, second: number) => DateType;

  // Compare
  isAfter: (date1: DateType, date2: DateType) => boolean;
  isValidate: (date: DateType) => boolean;

  locale: {
    getWeekFirstDay: (locale: string) => number;
    getWeek: (locale: string, value: DateType) => number;

    format: (locale: string, date: DateType, format: string) => string;

    /** Should only return validate date instance */
    parse: (locale: string, text: string, formats: string[]) => DateType | null;

    /** A proxy for getting locale with moment or other locale library */
    getShortWeekDays?: (locale: string) => string[];
    /** A proxy for getting locale with moment or other locale library */
    getShortMonths?: (locale: string) => string[];
  };
}

export type LocalePresetType =
  | 'af'
  | 'ar-dz'
  | 'ar-kw'
  | 'ar-ly'
  | 'ar-ma'
  | 'ar-sa'
  | 'ar-tn'
  | 'ar'
  | 'az'
  | 'be'
  | 'bg'
  | 'bi'
  | 'bm'
  | 'bn'
  | 'bo'
  | 'br'
  | 'bs'
  | 'ca'
  | 'cs'
  | 'cv'
  | 'cy'
  | 'da'
  | 'de-at'
  | 'de-ch'
  | 'de'
  | 'dv'
  | 'el'
  | 'en-SG'
  | 'en-au'
  | 'en-ca'
  | 'en-gb'
  | 'en-ie'
  | 'en-il'
  | 'en-in'
  | 'en-nz'
  | 'en-tt'
  | 'en'
  | 'eo'
  | 'es-do'
  | 'es-us'
  | 'es'
  | 'et'
  | 'eu'
  | 'fa'
  | 'fi'
  | 'fo'
  | 'fr-ca'
  | 'fr-ch'
  | 'fr'
  | 'fy'
  | 'ga'
  | 'gd'
  | 'gl'
  | 'gom-latn'
  | 'gu'
  | 'he'
  | 'hi'
  | 'hr'
  | 'hu'
  | 'hy-am'
  | 'id'
  | 'is'
  | 'it-ch'
  | 'it'
  | 'ja'
  | 'jv'
  | 'ka'
  | 'kk'
  | 'km'
  | 'kn'
  | 'ko'
  | 'ku'
  | 'ky'
  | 'lb'
  | 'lo'
  | 'lt'
  | 'lv'
  | 'me'
  | 'mi'
  | 'mk'
  | 'ml'
  | 'mn'
  | 'mr'
  | 'ms-my'
  | 'ms'
  | 'mt'
  | 'my'
  | 'nb'
  | 'ne'
  | 'nl-be'
  | 'nl'
  | 'nn'
  | 'oc-lnc'
  | 'pa-in'
  | 'pl'
  | 'pt-br'
  | 'pt'
  | 'ro'
  | 'ru'
  | 'rw'
  | 'sd'
  | 'se'
  | 'si'
  | 'sk'
  | 'sl'
  | 'sq'
  | 'sr-cyrl'
  | 'sr'
  | 'ss'
  | 'sv'
  | 'sw'
  | 'ta'
  | 'te'
  | 'tet'
  | 'tg'
  | 'th'
  | 'tk'
  | 'tl-ph'
  | 'tlh'
  | 'tr'
  | 'tzl'
  | 'tzm-latn'
  | 'tzm'
  | 'ug-cn'
  | 'uk'
  | 'ur'
  | 'uz-latn'
  | 'uz'
  | 'vi'
  | 'x-pseudo'
  | 'yo'
  | 'zh-cn'
  | 'zh-hk'
  | 'zh-tw'
  | 'zh';

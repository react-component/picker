import type { Temporal as TemporalPolyfill } from '@js-temporal/polyfill';

import type { GenerateConfig } from '.';

type TemporalDateTime = TemporalPolyfill.PlainDateTime;

type TemporalDateTimeInput =
  | TemporalDateTime
  | string
  | {
      year: number;
      month: number;
      day: number;
      hour?: number;
      minute?: number;
      second?: number;
      millisecond?: number;
    };

type TemporalGlobal = {
  PlainDateTime: {
    from: (
      value: TemporalDateTimeInput,
      options?: {
        overflow?: 'constrain' | 'reject';
      },
    ) => TemporalDateTime;
    compare: (date1: TemporalDateTime, date2: TemporalDateTime) => number;
  };
  Now: {
    plainDateTimeISO: () => TemporalDateTime;
  };
};

type ParsedWeek = {
  week: number;
  weekYear: number;
};

type LocaleWeekInfo = {
  firstDay: number;
  minimalDays: number;
};

type LocaleWeekInfoSource = {
  firstDay: number;
  minimalDays: number;
};

type OverflowMode = 'constrain' | 'reject';

const ISO_WEEK_INFO: LocaleWeekInfo = {
  firstDay: 1,
  minimalDays: 4,
};

const weekDayFormatLocaleMap: Record<string, 'narrow' | 'short'> = {
  'zh-CN': 'narrow',
  'zh-TW': 'narrow',
};

const weekDayTruncateLengthMap: Record<string, number> = {
  'en-US': 2,
  'en-GB': 2,
};

export const TEMPORAL_MISSING_ERROR =
  'Temporal API is not available. Please use a runtime with native Temporal support or attach @js-temporal/polyfill to globalThis.Temporal before using @rc-component/picker/generate/temporal.';

const localeWeekInfoFallbackMap: Record<string, LocaleWeekInfo> = {
  ar: { firstDay: 6, minimalDays: 1 },
  'ar-EG': { firstDay: 0, minimalDays: 1 },
  'ar-MA': { firstDay: 1, minimalDays: 1 },
  en: { firstDay: 0, minimalDays: 1 },
  'en-US': { firstDay: 0, minimalDays: 1 },
  fr: { firstDay: 1, minimalDays: 4 },
  'fr-FR': { firstDay: 1, minimalDays: 4 },
  it: { firstDay: 1, minimalDays: 4 },
  'it-IT': { firstDay: 1, minimalDays: 4 },
  ko: { firstDay: 0, minimalDays: 1 },
  'ko-KR': { firstDay: 0, minimalDays: 1 },
  zh: { firstDay: 1, minimalDays: 4 },
  'zh-CN': { firstDay: 1, minimalDays: 4 },
};

const localeMonthNamesCache = new Map<string, string[]>();
const localeWeekDaysCache = new Map<string, string[]>();
const localeShortWeekDaysCache = new Map<string, string[]>();
const localeDayPeriodsCache = new Map<string, { am: string; pm: string }>();

const padStart = (value: number, length = 2) => String(value).padStart(length, '0');

const normalizeLocale = (locale: string) => locale.replace(/_/g, '-');

const getLocaleLanguage = (locale: string) => normalizeLocale(locale).split('-')[0];

const getEnglishOrdinalSuffix = (value: number) => {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return 'st';
  }
  if (mod10 === 2 && mod100 !== 12) {
    return 'nd';
  }
  if (mod10 === 3 && mod100 !== 13) {
    return 'rd';
  }

  return 'th';
};

const getOrdinalValue = (locale: string, value: number, unit: 'day' | 'week') => {
  const language = getLocaleLanguage(locale);

  if (language === 'zh') {
    return `${value}${unit === 'week' ? '周' : '日'}`;
  }

  if (language === 'en') {
    return `${value}${getEnglishOrdinalSuffix(value)}`;
  }

  return String(value);
};

const isLocaleWeekInfoSource = (value: unknown): value is LocaleWeekInfoSource =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as LocaleWeekInfoSource).firstDay === 'number' &&
  typeof (value as LocaleWeekInfoSource).minimalDays === 'number';

const getTemporal = (): TemporalGlobal => {
  const temporal = globalThis.Temporal;

  if (!temporal?.PlainDateTime || !temporal?.Now) {
    throw new Error(TEMPORAL_MISSING_ERROR);
  }

  return temporal as unknown as TemporalGlobal;
};

const createDateTime = (
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
  overflow: OverflowMode = 'constrain',
) =>
  getTemporal().PlainDateTime.from(
    {
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
    },
    { overflow },
  );

const isTemporalDateTime = (value: unknown): value is TemporalDateTime => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return (
    typeof (value as TemporalDateTime).year === 'number' &&
    typeof (value as TemporalDateTime).month === 'number' &&
    typeof (value as TemporalDateTime).day === 'number' &&
    typeof (value as TemporalDateTime).hour === 'number' &&
    typeof (value as TemporalDateTime).minute === 'number' &&
    typeof (value as TemporalDateTime).second === 'number' &&
    typeof (value as TemporalDateTime).millisecond === 'number' &&
    typeof (value as TemporalDateTime).with === 'function' &&
    typeof (value as TemporalDateTime).add === 'function' &&
    typeof (value as TemporalDateTime).toPlainDate === 'function'
  );
};

const getWeekInfo = (locale: string): LocaleWeekInfo => {
  const normalized = normalizeLocale(locale);
  const language = getLocaleLanguage(locale);

  if (typeof Intl?.Locale === 'function') {
    try {
      const localeInfo = new Intl.Locale(normalized) as Intl.Locale & {
        getWeekInfo?: () => unknown;
        weekInfo?: unknown;
      };

      const weekInfo = localeInfo.weekInfo || localeInfo.getWeekInfo?.();

      if (isLocaleWeekInfoSource(weekInfo)) {
        return {
          firstDay: weekInfo.firstDay % 7,
          minimalDays: weekInfo.minimalDays,
        };
      }
    } catch {
      // Fallback below.
    }
  }

  if (localeWeekInfoFallbackMap[normalized]) {
    return localeWeekInfoFallbackMap[normalized];
  }

  if (localeWeekInfoFallbackMap[language]) {
    return localeWeekInfoFallbackMap[language];
  }

  return ISO_WEEK_INFO;
};

const getLocaleMonthNames = (locale: string, width: 'short' | 'long') => {
  const normalized = normalizeLocale(locale);
  const cacheKey = `${normalized}:${width}`;
  const cached = localeMonthNamesCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat(normalized, {
    month: width,
    timeZone: 'UTC',
  });
  const monthNames = Array.from({ length: 12 }, (_, index) =>
    formatter.format(new Date(Date.UTC(2020, index, 1))),
  );

  localeMonthNamesCache.set(cacheKey, monthNames);
  return monthNames;
};

const getLocaleWeekDays = (locale: string, width: 'long' | 'short') => {
  const normalized = normalizeLocale(locale);
  const cacheKey = `${normalized}:${width}`;
  const cached = localeWeekDaysCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat(normalized, {
    weekday: width,
    timeZone: 'UTC',
  });
  const weekDays = Array.from({ length: 7 }, (_, index) =>
    formatter.format(new Date(Date.UTC(2024, 0, 7 + index))),
  );

  localeWeekDaysCache.set(cacheKey, weekDays);
  return weekDays;
};

const getLocaleDayPeriods = (locale: string) => {
  const normalized = normalizeLocale(locale);
  const cached = localeDayPeriodsCache.get(normalized);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat(normalized, {
    hour: 'numeric',
    hour12: true,
    timeZone: 'UTC',
  });

  const getPeriod = (hour: number) => {
    const parts = formatter.formatToParts(new Date(Date.UTC(2020, 0, 1, hour)));
    return parts.find((part) => part.type === 'dayPeriod')?.value;
  };

  const dayPeriods = {
    am: getPeriod(1) || 'AM',
    pm: getPeriod(13) || 'PM',
  };

  localeDayPeriodsCache.set(normalized, dayPeriods);
  return dayPeriods;
};

const getShortWeekDays = (locale: string) => {
  const normalized = normalizeLocale(locale);
  const cached = localeShortWeekDaysCache.get(normalized);

  if (cached) {
    return cached;
  }

  const format = weekDayFormatLocaleMap[normalized] || 'short';
  const sliceLength = weekDayTruncateLengthMap[normalized];
  const formatter = new Intl.DateTimeFormat(normalized, {
    weekday: format,
    timeZone: 'UTC',
  });
  const shortWeekDays = Array.from({ length: 7 }, (_, index) => {
    const weekday = formatter.format(new Date(Date.UTC(2024, 0, 7 + index)));

    return sliceLength ? weekday.slice(0, sliceLength) : weekday;
  });

  localeShortWeekDaysCache.set(normalized, shortWeekDays);
  return shortWeekDays;
};

const getDayOfWeekName = (
  locale: string,
  date: TemporalDateTime,
  format: 'dddd' | 'ddd' | 'dd',
) => {
  const weekDayIndex = getWeekDayIndex(date);

  if (format === 'dddd') {
    return getLocaleWeekDays(locale, 'long')[weekDayIndex];
  }

  if (format === 'ddd') {
    return getLocaleWeekDays(locale, 'short')[weekDayIndex];
  }

  return getShortWeekDays(locale)[weekDayIndex];
};

const getWeekDayIndex = (date: TemporalDateTime) => date.dayOfWeek % 7;

const getWeekStart = (date: TemporalDateTime, firstDay: number) => {
  const currentDay = getWeekDayIndex(date);
  let diff = firstDay - currentDay;

  if (currentDay < firstDay) {
    diff -= 7;
  }

  return date.add({ days: diff });
};

const getWeekYearStart = (year: number, weekInfo: LocaleWeekInfo) => {
  const firstDate = createDateTime(year, 1, 1);
  const weekStart = getWeekStart(firstDate, weekInfo.firstDay);
  const weekDayOffset = (getWeekDayIndex(firstDate) - weekInfo.firstDay + 7) % 7;
  const firstWeekDays = 7 - weekDayOffset;

  return firstWeekDays >= weekInfo.minimalDays ? weekStart : weekStart.add({ days: 7 });
};

const getTokenWeekInfo = (locale: string, weekType: 'locale' | 'iso') =>
  weekType === 'iso' ? ISO_WEEK_INFO : getWeekInfo(locale);

const getWeekInfoForDate = (
  locale: string,
  date: TemporalDateTime,
  weekType: 'locale' | 'iso' = 'locale',
): ParsedWeek => {
  const weekInfo = getTokenWeekInfo(locale, weekType);
  const currentWeekStart = getWeekStart(date, weekInfo.firstDay);

  let weekYear = date.year;
  let weekYearStart = getWeekYearStart(weekYear, weekInfo);

  if (getTemporal().PlainDateTime.compare(currentWeekStart, weekYearStart) < 0) {
    weekYear -= 1;
    weekYearStart = getWeekYearStart(weekYear, weekInfo);
  } else {
    const nextWeekYearStart = getWeekYearStart(weekYear + 1, weekInfo);
    if (getTemporal().PlainDateTime.compare(currentWeekStart, nextWeekYearStart) >= 0) {
      weekYear += 1;
      weekYearStart = nextWeekYearStart;
    }
  }

  const diffDays = currentWeekStart.toPlainDate().since(weekYearStart.toPlainDate()).days;

  return {
    week: Math.floor(diffDays / 7) + 1,
    weekYear,
  };
};

const getQuarter = (date: TemporalDateTime) => Math.floor((date.month - 1) / 3) + 1;

const getWeekOrdinal = (locale: string, week: number) => getOrdinalValue(locale, week, 'week');

const tokenList = [
  'YYYY',
  'GGGG',
  'gggg',
  'dddd',
  'ddd',
  'MMMM',
  'MMM',
  'SSS',
  'Wo',
  'Do',
  'wo',
  'ww',
  'WW',
  'YY',
  'MM',
  'DD',
  'dd',
  'HH',
  'hh',
  'mm',
  'ss',
  'Q',
  'W',
  'w',
  'M',
  'D',
  'H',
  'h',
  'm',
  's',
  'A',
  'a',
] as const;

type Token = (typeof tokenList)[number];

type FormatPart =
  | {
      type: 'literal';
      value: string;
    }
  | {
      type: 'token';
      value: Token;
    };

const parseFormatParts = (format: string): FormatPart[] => {
  const parts: FormatPart[] = [];
  let index = 0;

  while (index < format.length) {
    if (format[index] === '[') {
      const closeIndex = format.indexOf(']', index + 1);
      const literal =
        closeIndex === -1 ? format.slice(index + 1) : format.slice(index + 1, closeIndex);

      parts.push({
        type: 'literal',
        value: literal,
      });

      index = closeIndex === -1 ? format.length : closeIndex + 1;
      continue;
    }

    const token = tokenList.find((currentToken) => format.startsWith(currentToken, index));
    if (token) {
      parts.push({
        type: 'token',
        value: token,
      });
      index += token.length;
      continue;
    }

    parts.push({
      type: 'literal',
      value: format[index],
    });
    index += 1;
  }

  return parts;
};

const formatToken = (locale: string, date: TemporalDateTime, token: Token) => {
  let localeWeekData: ParsedWeek | undefined;
  let isoWeekData: ParsedWeek | undefined;

  const getWeekData = (weekType: 'locale' | 'iso') => {
    if (weekType === 'iso') {
      isoWeekData ||= getWeekInfoForDate(locale, date, 'iso');
      return isoWeekData;
    }

    localeWeekData ||= getWeekInfoForDate(locale, date, 'locale');
    return localeWeekData;
  };

  switch (token) {
    case 'YYYY':
      return padStart(date.year, 4);
    case 'YY':
      return padStart(date.year % 100, 2);
    case 'GGGG':
      return padStart(getWeekData('iso').weekYear, 4);
    case 'gggg':
      return padStart(getWeekData('locale').weekYear, 4);
    case 'dddd':
    case 'ddd':
    case 'dd':
      return getDayOfWeekName(locale, date, token);
    case 'MMMM':
      return getLocaleMonthNames(locale, 'long')[date.month - 1];
    case 'MMM':
      return getLocaleMonthNames(locale, 'short')[date.month - 1];
    case 'MM':
      return padStart(date.month);
    case 'M':
      return String(date.month);
    case 'DD':
      return padStart(date.day);
    case 'D':
      return String(date.day);
    case 'Do':
      return getOrdinalValue(locale, date.day, 'day');
    case 'HH':
      return padStart(date.hour);
    case 'H':
      return String(date.hour);
    case 'hh': {
      const hour = date.hour % 12 || 12;
      return padStart(hour);
    }
    case 'h':
      return String(date.hour % 12 || 12);
    case 'mm':
      return padStart(date.minute);
    case 'm':
      return String(date.minute);
    case 'ss':
      return padStart(date.second);
    case 's':
      return String(date.second);
    case 'SSS':
      return padStart(date.millisecond, 3);
    case 'Q':
      return String(getQuarter(date));
    case 'WW':
      return padStart(getWeekData('iso').week);
    case 'ww':
      return padStart(getWeekData('locale').week);
    case 'W':
      return String(getWeekData('iso').week);
    case 'w':
      return String(getWeekData('locale').week);
    case 'Wo':
      return getWeekOrdinal(locale, getWeekData('iso').week);
    case 'wo':
      return getWeekOrdinal(locale, getWeekData('locale').week);
    case 'A': {
      const dayPeriods = getLocaleDayPeriods(locale);
      return date.hour < 12 ? dayPeriods.am : dayPeriods.pm;
    }
    case 'a': {
      const dayPeriods = getLocaleDayPeriods(locale);
      return (date.hour < 12 ? dayPeriods.am : dayPeriods.pm).toLowerCase();
    }
    default:
      return token;
  }
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getMonthNameMatcher = (locale: string, width: 'short' | 'long') => {
  const monthNames = getLocaleMonthNames(locale, width);
  const matcher = monthNames
    .slice()
    .sort((left, right) => right.length - left.length)
    .map(escapeRegExp)
    .join('|');

  return {
    matcher,
    monthNames,
  };
};

const getWeekDayMatcher = (locale: string, width: 'long' | 'short' | 'min') => {
  const weekDays = width === 'min' ? getShortWeekDays(locale) : getLocaleWeekDays(locale, width);
  const matcher = Array.from(new Set(weekDays))
    .sort((left, right) => right.length - left.length)
    .map(escapeRegExp)
    .join('|');

  return {
    matcher,
    weekDays,
  };
};

const getDayPeriodMatcher = (locale: string) => {
  const periods = getLocaleDayPeriods(locale);

  return Array.from(
    new Set([
      periods.am,
      periods.pm,
      periods.am.toUpperCase(),
      periods.pm.toUpperCase(),
      periods.am.toLowerCase(),
      periods.pm.toLowerCase(),
      'AM',
      'PM',
      'am',
      'pm',
    ]),
  )
    .sort((left, right) => right.length - left.length)
    .map(escapeRegExp)
    .join('|');
};

const buildParseMatcher = (locale: string, parts: FormatPart[]) => {
  const hasToken = (tokens: Token[]) =>
    parts.some((part) => part.type === 'token' && tokens.includes(part.value));
  const emptyMonthMatcher = {
    matcher: '',
    monthNames: [] as string[],
  };
  const monthShort = hasToken(['MMM']) ? getMonthNameMatcher(locale, 'short') : emptyMonthMatcher;
  const monthLong = hasToken(['MMMM']) ? getMonthNameMatcher(locale, 'long') : emptyMonthMatcher;
  const weekDayLong = hasToken(['dddd']) ? getWeekDayMatcher(locale, 'long') : null;
  const weekDayShort = hasToken(['ddd']) ? getWeekDayMatcher(locale, 'short') : null;
  const weekDayMin = hasToken(['dd']) ? getWeekDayMatcher(locale, 'min') : null;
  const meridiemMatcher = hasToken(['A', 'a']) ? getDayPeriodMatcher(locale) : '';

  const regexParts = parts.map((part, index) => {
    if (part.type === 'literal') {
      return escapeRegExp(part.value);
    }

    const key = `${part.value}_${index}`;

    switch (part.value) {
      case 'YYYY':
      case 'GGGG':
      case 'gggg':
        return `(?<${key}>\\d{4})`;
      case 'YY':
        return `(?<${key}>\\d{2})`;
      case 'dddd':
        return `(?<${key}>${weekDayLong!.matcher})`;
      case 'ddd':
        return `(?<${key}>${weekDayShort!.matcher})`;
      case 'MMMM':
        return `(?<${key}>${monthLong.matcher})`;
      case 'MMM':
        return `(?<${key}>${monthShort.matcher})`;
      case 'MM':
      case 'DD':
      case 'HH':
      case 'hh':
      case 'mm':
      case 'ss':
      case 'ww':
      case 'WW':
        return `(?<${key}>\\d{2})`;
      case 'M':
      case 'D':
      case 'H':
      case 'h':
      case 'm':
      case 's':
      case 'Q':
      case 'w':
      case 'W':
        return `(?<${key}>\\d{1,2})`;
      case 'SSS':
        return `(?<${key}>\\d{1,3})`;
      case 'dd':
        return `(?<${key}>${weekDayMin!.matcher})`;
      case 'Wo':
      case 'Do':
      case 'wo':
        return `(?<${key}>\\d{1,2}(?:[^\\d\\s]+)?)`;
      case 'A':
      case 'a':
        return `(?<${key}>${meridiemMatcher})`;
      default:
        return '';
    }
  });

  return {
    matcher: new RegExp(`^${regexParts.join('')}$`, 'iu'),
    monthShort,
    monthLong,
  };
};

const parseWeekOrdinal = (value: string) => {
  const matched = value.match(/\d+/);
  return matched ? Number(matched[0]) : null;
};

const parseDateByWeek = (
  locale: string,
  weekYear: number,
  week: number,
  weekType: 'locale' | 'iso' = 'locale',
) => {
  if (week < 1 || week > 53) {
    return null;
  }

  const weekInfo = getTokenWeekInfo(locale, weekType);
  const weekYearStart = getWeekYearStart(weekYear, weekInfo);
  const result = weekYearStart.add({ days: (week - 1) * 7 });
  const parsedWeekInfo = getWeekInfoForDate(locale, result, weekType);

  if (parsedWeekInfo.weekYear !== weekYear || parsedWeekInfo.week !== week) {
    return null;
  }

  return result;
};

const parseTwoDigitYear = (value: string) => {
  const year = Number(value);

  return year <= 68 ? 2000 + year : 1900 + year;
};

const isMeridiemValue = (value: string, candidate: string) =>
  value.localeCompare(candidate, undefined, { sensitivity: 'accent' }) === 0 ||
  value.localeCompare(candidate, undefined, { sensitivity: 'base' }) === 0;

const isWeekDayValue = (value: string, candidate: string) =>
  value.localeCompare(candidate, undefined, { sensitivity: 'base' }) === 0;

const isPmMeridiem = (locale: string, meridiem: string) => {
  const periods = getLocaleDayPeriods(locale);

  return [periods.pm, 'PM', 'pm'].some((candidate) => isMeridiemValue(meridiem, candidate));
};

const isAmMeridiem = (locale: string, meridiem: string) => {
  const periods = getLocaleDayPeriods(locale);

  return [periods.am, 'AM', 'am'].some((candidate) => isMeridiemValue(meridiem, candidate));
};

const parseFromFormat = (locale: string, text: string, format: string): TemporalDateTime | null => {
  const parts = parseFormatParts(format);
  const { matcher, monthShort, monthLong } = buildParseMatcher(locale, parts);
  const matched = matcher.exec(text);

  if (!matched?.groups) {
    return null;
  }

  const parsedValues: Record<string, string> = matched.groups;

  let year: number | undefined;
  let month: number | undefined;
  let day: number | undefined;
  let hour: number | undefined;
  let minute: number | undefined;
  let second: number | undefined;
  let millisecond: number | undefined;
  let quarter: number | undefined;
  let meridiem: string | undefined;
  let parsedWeek: number | undefined;
  let parsedWeekYear: number | undefined;
  let parsedWeekType: 'locale' | 'iso' | undefined;
  let parsedWeekYearType: 'locale' | 'iso' | undefined;
  const parsedWeekDays: Array<{ token: 'dddd' | 'ddd' | 'dd'; value: string }> = [];
  let usedTimeToken = false;
  let usedTwelveHourToken = false;
  let usedDateToken = false;

  parts.forEach((part, index) => {
    if (part.type === 'literal') {
      return;
    }

    const value = parsedValues[`${part.value}_${index}`];
    if (value === undefined) {
      return;
    }

    switch (part.value) {
      case 'YYYY':
        year = Number(value);
        usedDateToken = true;
        break;
      case 'YY':
        year = parseTwoDigitYear(value);
        usedDateToken = true;
        break;
      case 'GGGG':
        parsedWeekYear = Number(value);
        parsedWeekYearType = 'iso';
        usedDateToken = true;
        break;
      case 'gggg':
        parsedWeekYear = Number(value);
        parsedWeekYearType = 'locale';
        usedDateToken = true;
        break;
      case 'MMMM':
        month = monthLong.monthNames.findIndex(
          (name) => name.toLowerCase() === value.toLowerCase(),
        );
        month = month === -1 ? Number.NaN : month + 1;
        usedDateToken = true;
        break;
      case 'MMM':
        month = monthShort.monthNames.findIndex(
          (name) => name.toLowerCase() === value.toLowerCase(),
        );
        month = month === -1 ? Number.NaN : month + 1;
        usedDateToken = true;
        break;
      case 'dddd':
      case 'ddd':
      case 'dd':
        parsedWeekDays.push({
          token: part.value,
          value,
        });
        usedDateToken = true;
        break;
      case 'MM':
      case 'M':
        month = Number(value);
        usedDateToken = true;
        break;
      case 'DD':
      case 'D':
        day = Number(value);
        usedDateToken = true;
        break;
      case 'Do':
        day = parseWeekOrdinal(value) ?? undefined;
        usedDateToken = true;
        break;
      case 'HH':
      case 'H':
        hour = Number(value);
        usedTimeToken = true;
        break;
      case 'hh':
      case 'h':
        hour = Number(value);
        usedTimeToken = true;
        usedTwelveHourToken = true;
        break;
      case 'mm':
      case 'm':
        minute = Number(value);
        usedTimeToken = true;
        break;
      case 'ss':
      case 's':
        second = Number(value);
        usedTimeToken = true;
        break;
      case 'SSS':
        millisecond = Number(value);
        usedTimeToken = true;
        break;
      case 'Q':
        quarter = Number(value);
        usedDateToken = true;
        break;
      case 'ww':
      case 'w':
        parsedWeek = Number(value);
        parsedWeekType = 'locale';
        usedDateToken = true;
        break;
      case 'WW':
      case 'W':
        parsedWeek = Number(value);
        parsedWeekType = 'iso';
        usedDateToken = true;
        break;
      case 'Wo':
        parsedWeek = parseWeekOrdinal(value) ?? undefined;
        parsedWeekType = 'iso';
        usedDateToken = true;
        break;
      case 'wo':
        parsedWeek = parseWeekOrdinal(value) ?? undefined;
        parsedWeekType = 'locale';
        usedDateToken = true;
        break;
      case 'A':
      case 'a':
        meridiem = value;
        usedTimeToken = true;
        break;
      default:
        break;
    }
  });

  if (
    [year, month, day, hour, minute, second, millisecond, quarter, parsedWeek, parsedWeekYear]
      .filter((value) => value !== undefined)
      .some((value) => Number.isNaN(value))
  ) {
    return null;
  }

  if (usedTwelveHourToken && hour !== undefined && (hour < 1 || hour > 12)) {
    return null;
  }

  if (
    parsedWeek !== undefined &&
    parsedWeekType &&
    parsedWeekYearType &&
    parsedWeekType !== parsedWeekYearType
  ) {
    return null;
  }

  let now: TemporalDateTime | undefined;
  const getNow = () => {
    now ||= generateConfig.getNow();
    return now;
  };
  let result: TemporalDateTime;

  try {
    if (parsedWeek !== undefined && (parsedWeekYear !== undefined || year !== undefined)) {
      result = parseDateByWeek(locale, parsedWeekYear ?? year!, parsedWeek, parsedWeekType);
      if (!result) {
        return null;
      }
    } else if (
      year !== undefined ||
      month !== undefined ||
      day !== undefined ||
      quarter !== undefined
    ) {
      const parsedYear = year ?? getNow().year;
      const parsedMonth = month ?? (quarter !== undefined ? (quarter - 1) * 3 + 1 : 1);
      const parsedDay = day ?? 1;
      result = createDateTime(parsedYear, parsedMonth, parsedDay, 0, 0, 0, 0, 'reject');
    } else if (usedTimeToken) {
      const current = getNow();
      result = createDateTime(current.year, current.month, current.day, 0, 0, 0, 0, 'reject');
    } else {
      return null;
    }

    if (
      hour !== undefined ||
      minute !== undefined ||
      second !== undefined ||
      millisecond !== undefined
    ) {
      let parsedHour = hour ?? 0;

      if (usedTwelveHourToken) {
        if (meridiem && isPmMeridiem(locale, meridiem)) {
          if (parsedHour < 12) {
            parsedHour += 12;
          }
        } else if (meridiem && isAmMeridiem(locale, meridiem) && parsedHour === 12) {
          parsedHour = 0;
        }
      }

      result = result.with(
        {
          hour: parsedHour,
          minute: minute ?? 0,
          second: second ?? 0,
          millisecond: millisecond ?? 0,
        },
        { overflow: 'reject' },
      );
    } else if (usedDateToken) {
      result = result.with(
        {
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        { overflow: 'constrain' },
      );
    }
  } catch {
    return null;
  }

  if (
    parsedWeekDays.some(
      ({ token, value }) => !isWeekDayValue(value, getDayOfWeekName(locale, result, token)),
    )
  ) {
    return null;
  }

  return generateConfig.isValidate(result) ? result : null;
};

const generateConfig: GenerateConfig<TemporalDateTime> = {
  getNow: () => getTemporal().Now.plainDateTimeISO(),
  getFixedDate: (value) => {
    const matched = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

    if (!matched) {
      throw new Error(`Invalid fixed date value: ${value}`);
    }

    return createDateTime(
      Number(matched[1]),
      Number(matched[2]),
      Number(matched[3]),
      0,
      0,
      0,
      0,
      'reject',
    );
  },
  getEndDate: (date) => date.with({ day: date.daysInMonth }, { overflow: 'constrain' }),
  getWeekDay: (date) => getWeekDayIndex(date),
  getYear: (date) => date.year,
  getMonth: (date) => date.month - 1,
  getDate: (date) => date.day,
  getHour: (date) => date.hour,
  getMinute: (date) => date.minute,
  getSecond: (date) => date.second,
  getMillisecond: (date) => date.millisecond,

  addYear: (date, diff) => date.add({ years: diff }),
  addMonth: (date, diff) => date.add({ months: diff }),
  addDate: (date, diff) => date.add({ days: diff }),
  setYear: (date, year) => date.with({ year }, { overflow: 'constrain' }),
  setMonth: (date, month) => date.with({ month: month + 1 }, { overflow: 'constrain' }),
  setDate: (date, day) => date.with({ day }, { overflow: 'constrain' }),
  setHour: (date, hour) => date.with({ hour }, { overflow: 'constrain' }),
  setMinute: (date, minute) => date.with({ minute }, { overflow: 'constrain' }),
  setSecond: (date, second) => date.with({ second }, { overflow: 'constrain' }),
  setMillisecond: (date, millisecond) => date.with({ millisecond }, { overflow: 'constrain' }),

  isAfter: (date1, date2) => getTemporal().PlainDateTime.compare(date1, date2) > 0,
  isValidate: (date) => {
    if (!isTemporalDateTime(date)) {
      return false;
    }

    try {
      getTemporal().PlainDateTime.from(date);
      return true;
    } catch {
      return false;
    }
  },

  locale: {
    getWeekFirstDay: (locale) => getWeekInfo(locale).firstDay,
    getWeekFirstDate: (locale, date) => getWeekStart(date, getWeekInfo(locale).firstDay),
    getWeek: (locale, date) => getWeekInfoForDate(locale, date).week,
    getShortWeekDays,
    getShortMonths: (locale) => getLocaleMonthNames(locale, 'short'),
    format: (locale, date, format) => {
      if (!date || !generateConfig.isValidate(date)) {
        return '';
      }

      return parseFormatParts(format)
        .map((part) =>
          part.type === 'literal' ? part.value : formatToken(locale, date, part.value),
        )
        .join('');
    },
    parse: (locale, text, formats) => {
      for (let index = 0; index < formats.length; index += 1) {
        const parsed = parseFromFormat(locale, text, formats[index]);

        if (parsed) {
          return parsed;
        }
      }

      return null;
    },
  },
};

export default generateConfig;

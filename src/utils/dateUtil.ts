import { GenerateConfig } from '../generate';

export const WEEK_DAY_COUNT = 7;

export function isNullEqual<T>(value1: T, value2: T): boolean | undefined {
  if (!value1 && !value2) {
    return true;
  }
  if (!value1 || !value2) {
    return false;
  }
  return undefined;
}

export function isSameMonth<DateType>(
  generateConfig: GenerateConfig<DateType>,
  month1: DateType | null,
  month2: DateType | null,
) {
  const equal = isNullEqual(month1, month2);
  if (typeof equal === 'boolean') {
    return equal;
  }

  return (
    generateConfig.getYear(month1!) === generateConfig.getYear(month2!) &&
    generateConfig.getMonth(month1!) === generateConfig.getMonth(month2!)
  );
}

export function isSameDate<DateType>(
  generateConfig: GenerateConfig<DateType>,
  date1?: DateType | null,
  date2?: DateType | null,
) {
  const equal = isNullEqual(date1, date2);
  if (typeof equal === 'boolean') {
    return equal;
  }

  return (
    generateConfig.getYear(date1!) === generateConfig.getYear(date2!) &&
    generateConfig.getMonth(date1!) === generateConfig.getMonth(date2!) &&
    generateConfig.getDate(date1!) === generateConfig.getDate(date2!)
  );
}

export function isSameTime<DateType>(
  generateConfig: GenerateConfig<DateType>,
  time1?: DateType | null,
  time2?: DateType | null,
) {
  const equal = isNullEqual(time1, time2);
  if (typeof equal === 'boolean') {
    return equal;
  }

  return (
    generateConfig.getHour(time1!) === generateConfig.getHour(time2!) &&
    generateConfig.getMinute(time1!) === generateConfig.getMinute(time2!) &&
    generateConfig.getSecond(time1!) === generateConfig.getSecond(time2!)
  );
}

export function isSameWeek<DateType>(
  generateConfig: GenerateConfig<DateType>,
  locale: string,
  date1?: DateType | null,
  date2?: DateType | null,
) {
  const equal = isNullEqual(date1, date2);
  if (typeof equal === 'boolean') {
    return equal;
  }

  return (
    generateConfig.locale.getWeek(locale, date1!) ===
    generateConfig.locale.getWeek(locale, date2!)
  );
}

export function isEqual<DateType>(
  generateConfig: GenerateConfig<DateType>,
  value1?: DateType | null,
  value2?: DateType | null,
) {
  return (
    isSameDate(generateConfig, value1, value2) &&
    isSameTime(generateConfig, value1, value2)
  );
}

export function getWeekStartDate<DateType>(
  locale: string,
  generateConfig: GenerateConfig<DateType>,
  value: DateType,
) {
  const weekFirstDay = generateConfig.locale.getWeekFirstDay(locale);
  const monthStartDate = generateConfig.setDate(value, 1);

  for (let i = 0; i < 7; i += 1) {
    const current = generateConfig.addDate(monthStartDate, -i);
    if (generateConfig.getWeekDay(current) === weekFirstDay) {
      return current;
    }
  }

  return value;
}

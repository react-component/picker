import { GenerateConfig } from './generateUtil';

export const WEEK_DAY_COUNT = 7;

export function isSameMonth<DateType>(
  generateConfig: GenerateConfig<DateType>,
  month1: DateType,
  month2: DateType,
) {
  return (
    generateConfig.getYear(month1) === generateConfig.getYear(month2) &&
    generateConfig.getMonth(month1) === generateConfig.getMonth(month2)
  );
}

export function isSameDate<DateType>(
  generateConfig: GenerateConfig<DateType>,
  date1?: DateType,
  date2?: DateType,
) {
  if (!date1 && !date2) {
    return true;
  } if (!date1 || !date2) {
    return false;
  }

  return (
    generateConfig.getYear(date1) === generateConfig.getYear(date2) &&
    generateConfig.getMonth(date1) === generateConfig.getMonth(date2) &&
    generateConfig.getDate(date1) === generateConfig.getDate(date2)
  );
}

export function isSameTime<DateType>(
  generateConfig: GenerateConfig<DateType>,
  time1?: DateType,
  time2?: DateType,
) {
  if (!time1 && !time2) {
    return true;
  } if (!time1 || !time2) {
    return false;
  }

  return (
    generateConfig.getHour(time1) === generateConfig.getHour(time2) &&
    generateConfig.getMinute(time1) === generateConfig.getMinute(time2) &&
    generateConfig.getSecond(time1) === generateConfig.getSecond(time2)
  );
}

export function isEqual<DateType>(
  generateConfig: GenerateConfig<DateType>,
  value1?: DateType,
  value2?: DateType,
) {
  return (
    isSameDate(generateConfig, value1, value2) &&
    isSameTime(generateConfig, value1, value2)
  );
}

interface VisibleDate<DateType> {
  date: DateType;
  currentMonth: boolean;
}

export function getVisibleDates<DateType>(
  locale: string,
  generateConfig: GenerateConfig<DateType>,
  rowCount: number,
  value: DateType,
): VisibleDate<DateType>[] {
  const dateList: VisibleDate<DateType>[] = [];

  // Prepare date
  const weekFirstDay = generateConfig.locale.getWeekFirstDay(locale);
  const startDate = generateConfig.getFirstDateOfMonth(value);
  const endDate = generateConfig.getLastDateOfMonth(value);
  const startWeekDay = generateConfig.getWeekDay(startDate);

  // Insert before weekday
  let weekday = startWeekDay;
  let date = startDate;
  while (weekday !== weekFirstDay) {
    weekday = (weekday - 1 + WEEK_DAY_COUNT) % WEEK_DAY_COUNT;
    date = generateConfig.addDate(date, -1);

    dateList.unshift({ date, currentMonth: false });
  }

  // Insert current month
  const total = WEEK_DAY_COUNT * rowCount;
  let currentMonth = true;
  date = startDate;
  for (let i = 0; i < total; i += 1) {
    dateList.push({ date, currentMonth });

    if (dateList.length >= total) {
      break;
    }

    if (isSameDate(generateConfig, date, endDate)) {
      currentMonth = false;
    }

    date = generateConfig.addDate(date, 1);
  }

  return dateList;
}

import { GenerateConfig, isSameDate } from './generateUtil';

export const WEEK_DAY_COUNT = 7;

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

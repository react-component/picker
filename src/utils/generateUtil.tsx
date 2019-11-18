export interface GenerateConfig<DateType> {
  // Get
  getFirstDateOfMonth: (value: DateType) => DateType;
  getLastDateOfMonth: (value: DateType) => DateType;
  getWeekDay: (value: DateType) => number;
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

  locale: {
    getWeekFirstDay: (locale: string) => number;

    format: (locale: string, date: DateType, format: string) => string;

    /** A proxy for getting locale with moment or other locale library */
    getShortWeekDays?: (locale: string) => string[];
    /** A proxy for getting locale with moment or other locale library */
    getShortMonths?: (locale: string) => string[];
  };
}

export function isSameDate<DateType>(
  generateConfig: GenerateConfig<DateType>,
  date1: DateType,
  date2: DateType,
) {
  return (
    generateConfig.getYear(date1) === generateConfig.getYear(date2) &&
    generateConfig.getMonth(date1) === generateConfig.getMonth(date2) &&
    generateConfig.getDate(date1) === generateConfig.getDate(date2)
  );
}

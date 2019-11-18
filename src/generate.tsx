export interface GenerateConfig<DateType> {
  // Get
  getFirstDateOfMonth: (value: DateType) => DateType;
  getLastDateOfMonth: (value: DateType) => DateType;
  getWeekDay: (value: DateType) => number;
  getDate: (value: DateType) => number;
  getMonth: (value: DateType) => number;
  getNow: () => DateType;

  // Set
  addYear: (value: DateType, diff: number) => DateType;
  addMonth: (value: DateType, diff: number) => DateType;
  addDate: (value: DateType, diff: number) => DateType;
  setMonth: (value: DateType, month: number) => DateType;

  // Calculate
  isSameDate: (date1: DateType, date2: DateType) => boolean;

  locale: {
    getWeekFirstDay: (locale: string) => number;

    format: (locale: string, date: DateType, format: string) => string;

    /** A proxy for getting locale with moment or other locale library */
    getShortWeekDays?: (locale: string) => string[];
    /** A proxy for getting locale with moment or other locale library */
    getShortMonths?: (locale: string) => string[];
  };
}

function generate() {}

export default generate;

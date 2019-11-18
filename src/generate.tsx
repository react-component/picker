export interface GenerateConfig<DateType> {
  // Get
  getFirstDateOfMonth: (value: DateType) => DateType;
  getLastDateOfMonth: (value: DateType) => DateType;
  getWeekDay: (value: DateType) => number;
  getDate: (value: DateType) => number;

  // Set
  addMonth: (value: DateType, diff: number) => DateType;
  addDate: (value: DateType, diff: number) => DateType;

  // Calculate
  isSameDate: (date1: DateType, date2: DateType) => boolean;

  locale: {
    getWeekFirstDay: (locale: string) => number;
    getWeekDays: (locale: string) => string[];
  };
}

function generate() {}

export interface GenerateConfig {
  locale: {
    getWeekFirstDay: (locale: string) => number;
    getWeekDays: (locale: string) => string[];
  };
}

function generate() {}

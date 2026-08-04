import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'en_GB',
  today: 'Today',
  now: 'Now',
  backToToday: 'Back to today',
  ok: 'OK',
  clear: 'Clear',
  week: 'Week',
  month: 'Month',
  year: 'Year',
  hours: 'Hours',
  minutes: 'Minutes',
  seconds: 'Seconds',
  milliseconds: 'Milliseconds',
  timeSelect: 'Select time',
  dateSelect: 'Select date',
  monthSelect: 'Choose a month',
  yearSelect: 'Choose a year',
  decadeSelect: 'Choose a decade',
  hourSelect: 'Select an hour',
  minuteSelect: 'Select a minute',
  secondSelect: 'Select a second',
  millisecondSelect: 'Select a millisecond',
  meridiemSelect: 'Select a meridiem',

  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Last year',
  nextYear: 'Next year',
  previousDecade: 'Last decade',
  nextDecade: 'Next decade',
  previousCentury: 'Last century',
  nextCentury: 'Next century',
};

export default locale;

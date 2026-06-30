import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'en_US',
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
  timeSelect: 'select time',
  dateSelect: 'select date',
  weekSelect: 'Choose a week',
  monthSelect: 'Choose a month',
  yearSelect: 'Choose a year',
  decadeSelect: 'Choose a decade',
  hourSelect: 'Select an hour',
  minuteSelect: 'Select a minute',
  secondSelect: 'Select a second',
  millisecondSelect: 'Select a millisecond',
  meridiemSelect: 'Select a meridiem',

  previousMonth: 'Previous month (PageUp)',
  nextMonth: 'Next month (PageDown)',
  previousYear: 'Last year (Control + left)',
  nextYear: 'Next year (Control + right)',
  previousDecade: 'Last decade',
  nextDecade: 'Next decade',
  previousCentury: 'Last century',
  nextCentury: 'Next century',
};

export default locale;

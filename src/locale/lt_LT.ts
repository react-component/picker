import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'lt_LT',
  today: 'Šiandien',
  now: 'Dabar',
  backToToday: 'Rodyti šiandien',
  ok: 'Gerai',
  clear: 'Išvalyti',
  week: 'Savaitė',
  month: 'Mėnesis',
  year: 'Metai',
  hours: 'Valandos',
  minutes: 'Minutės',
  seconds: 'Sekundės',
  milliseconds: 'Milisekundės',
  timeSelect: 'Pasirinkti laiką',
  dateSelect: 'Pasirinkti datą',
  weekSelect: 'Pasirinkti savaitę',
  monthSelect: 'Pasirinkti mėnesį',
  yearSelect: 'Pasirinkti metus',
  decadeSelect: 'Pasirinkti dešimtmetį',
  hourSelect: 'Pasirinkite valandą',
  minuteSelect: 'Pasirinkite minutę',
  secondSelect: 'Pasirinkite sekundę',
  millisecondSelect: 'Pasirinkite milisekundę',
  meridiemSelect: 'Pasirinkite meridijemą',

  dayFormat: 'DD',

  previousMonth: 'Buvęs mėnesis',
  nextMonth: 'Kitas mėnesis',
  previousYear: 'Buvę metai',
  nextYear: 'Kiti metai',
  previousDecade: 'Buvęs dešimtmetis',
  nextDecade: 'Kitas dešimtmetis',
  previousCentury: 'Buvęs amžius',
  nextCentury: 'Kitas amžius',
};

export default locale;

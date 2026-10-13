import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'ro_RO',
  today: 'Azi',
  now: 'Acum',
  backToToday: 'Înapoi la azi',
  ok: 'OK',
  clear: 'Șterge',
  week: 'Săptămână',
  month: 'Lună',
  year: 'An',
  timeSelect: 'selectează ora',
  dateSelect: 'selectează data',
  weekSelect: 'Alege o săptămână',
  monthSelect: 'Alege o lună',
  yearSelect: 'Alege un an',
  decadeSelect: 'Alege un deceniu',
  hourSelect: 'Selectează ora',
  minuteSelect: 'Selectează minutul',
  secondSelect: 'Selectează secunda',
  millisecondSelect: 'Selectează milisecunda',
  meridiemSelect: 'Selectează AM/PM',

  previousMonth: 'Luna anterioară',
  nextMonth: 'Luna următoare',
  previousYear: 'Anul anterior',
  nextYear: 'Anul următor',
  previousDecade: 'Deceniul anterior',
  nextDecade: 'Deceniul următor',
  previousCentury: 'Secolul anterior',
  nextCentury: 'Secolul următor',
};

export default locale;

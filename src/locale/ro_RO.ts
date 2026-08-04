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
  hours: 'Ore',
  minutes: 'Minute',
  seconds: 'Secunde',
  milliseconds: 'Milisecunde',
  timeSelect: 'selectează timpul',
  dateSelect: 'selectează data',
  weekSelect: 'Alege o săptămână',
  monthSelect: 'Alege o lună',
  yearSelect: 'Alege un an',
  decadeSelect: 'Alege un deceniu',
  hourSelect: 'Selectați o oră',
  minuteSelect: 'Selectați un minut',
  secondSelect: 'Selectați o secundă',
  millisecondSelect: 'Selectați o milisecundă',
  meridiemSelect: 'Selectați meridianul',

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

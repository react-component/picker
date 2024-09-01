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
  month: 'Lună',
  year: 'An',
  timeSelect: 'selectează timpul',
  dateSelect: 'selectează data',
  weekSelect: 'Alege o săptămână',
  monthSelect: 'Alege o lună',
  yearSelect: 'Alege un an',
  decadeSelect: 'Alege un deceniu',

  dateFormat: 'D/M/YYYY',

  dateTimeFormat: 'D/M/YYYY HH:mm:ss',

  previousMonth: 'Luna anterioară (PageUp)',
  nextMonth: 'Luna următoare (PageDown)',
  previousYear: 'Anul anterior (Control + stânga)',
  nextYear: 'Anul următor (Control + dreapta)',
  previousDecade: 'Deceniul anterior',
  nextDecade: 'Deceniul următor',
  previousCentury: 'Secolul anterior',
  nextCentury: 'Secolul următor',
};

export default locale;

import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'el_GR',
  today: 'Σήμερα',
  now: 'Τώρα',
  backToToday: 'Πίσω στη σημερινή μέρα',
  ok: 'OK',
  clear: 'Καθαρισμός',
  month: 'Μήνας',
  year: 'Έτος',
  timeSelect: 'Επιλογή ώρας',
  dateSelect: 'Επιλογή ημερομηνίας',
  monthSelect: 'Επιλογή μήνα',
  yearSelect: 'Επιλογή έτους',
  decadeSelect: 'Επιλογή δεκαετίας',

  dateFormat: 'D/M/YYYY',

  dateTimeFormat: 'D/M/YYYY HH:mm:ss',

  previousMonth: 'Προηγούμενος μήνας (PageUp)',
  nextMonth: 'Επόμενος μήνας (PageDown)',
  previousYear: 'Προηγούμενο έτος (Control + αριστερά)',
  nextYear: 'Επόμενο έτος (Control + δεξιά)',
  previousDecade: 'Προηγούμενη δεκαετία',
  nextDecade: 'Επόμενη δεκαετία',
  previousCentury: 'Προηγούμενος αιώνας',
  nextCentury: 'Επόμενος αιώνας',
};

export default locale;

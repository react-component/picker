import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'de_DE',
  today: 'Heute',
  now: 'Jetzt',
  backToToday: 'Zurück zu Heute',
  ok: 'OK',
  clear: 'Zurücksetzen',
  week: 'Woche',
  month: 'Monat',
  year: 'Jahr',
  hours: 'Stunden',
  minutes: 'Minuten',
  seconds: 'Sekunden',
  milliseconds: 'Millisekunden',
  timeSelect: 'Zeit wählen',
  dateSelect: 'Datum wählen',
  monthSelect: 'Wähle einen Monat',
  yearSelect: 'Wähle ein Jahr',
  decadeSelect: 'Wähle ein Jahrzehnt',
  hourSelect: 'Stunde wählen',
  minuteSelect: 'Minute wählen',
  secondSelect: 'Sekunde wählen',
  millisecondSelect: 'Millisekunde wählen',
  meridiemSelect: 'Tageshälfte wählen',

  previousMonth: 'Vorheriger Monat (PageUp)',
  nextMonth: 'Nächster Monat (PageDown)',
  previousYear: 'Vorheriges Jahr (Ctrl + left)',
  nextYear: 'Nächstes Jahr (Ctrl + right)',
  previousDecade: 'Vorheriges Jahrzehnt',
  nextDecade: 'Nächstes Jahrzehnt',
  previousCentury: 'Vorheriges Jahrhundert',
  nextCentury: 'Nächstes Jahrhundert',
};

export default locale;

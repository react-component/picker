import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'it_IT',
  today: 'Oggi',
  now: 'Adesso',
  backToToday: 'Torna ad oggi',
  ok: 'OK',
  clear: 'Cancella',
  week: 'Settimana',
  month: 'Mese',
  year: 'Anno',
  timeSelect: "Seleziona l'ora",
  dateSelect: 'Seleziona la data',
  monthSelect: 'Seleziona il mese',
  yearSelect: "Seleziona l'anno",
  decadeSelect: 'Seleziona il decennio',

  previousMonth: 'Il mese scorso',
  nextMonth: 'Il prossimo mese',
  previousYear: "L'anno scorso",
  nextYear: "L'anno prossimo",
  previousDecade: 'Ultimo decennio',
  nextDecade: 'Prossimo decennio',
  previousCentury: 'Secolo precedente',
  nextCentury: 'Prossimo secolo',
  shortWeekDays: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
  shortMonths: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
};

export default locale;

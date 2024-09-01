import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'eu_ES',
  today: 'Gaur',
  now: 'Orain',
  backToToday: 'Gaur itzuli',
  ok: 'OK',
  clear: 'Garbitu',
  month: 'Hilabete',
  year: 'Urte',
  timeSelect: 'Ordua aukeratu',
  dateSelect: 'Eguna aukeratu',
  weekSelect: 'Astea aukeratu',
  monthSelect: 'Hilabetea aukeratu',
  yearSelect: 'Urtea aukeratu',
  decadeSelect: 'Hamarkada aukeratu',
  dateFormat: 'YYYY/M/D',
  dateTimeFormat: 'YYYY/M/D HH:mm:ss',
  monthBeforeYear: false,
  previousMonth: 'Aurreko hilabetea (RePag)',
  nextMonth: 'Urrengo hilabetea (AvPag)',
  previousYear: 'Aurreko urtea (Control + ezkerra)',
  nextYear: 'Urrento urtea (Control + eskuina)',
  previousDecade: 'Aurreko hamarkada',
  nextDecade: 'Urrengo hamarkada',
  previousCentury: 'Aurreko mendea',
  nextCentury: 'Urrengo mendea',
};

export default locale;

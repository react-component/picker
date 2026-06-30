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
  week: 'Asteko',
  month: 'Hilabete',
  year: 'Urte',
  timeSelect: 'Ordua aukeratu',
  dateSelect: 'Eguna aukeratu',
  weekSelect: 'Astea aukeratu',
  monthSelect: 'Hilabetea aukeratu',
  yearSelect: 'Urtea aukeratu',
  decadeSelect: 'Hamarkada aukeratu',
  monthBeforeYear: false,
  previousMonth: 'Aurreko hilabetea',
  nextMonth: 'Urrengo hilabetea',
  previousYear: 'Aurreko urtea',
  nextYear: 'Urrento urtea',
  previousDecade: 'Aurreko hamarkada',
  nextDecade: 'Urrengo hamarkada',
  previousCentury: 'Aurreko mendea',
  nextCentury: 'Urrengo mendea',
};

export default locale;

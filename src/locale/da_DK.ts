import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'da_DK',
  today: 'I dag',
  now: 'Nu',
  backToToday: 'Gå til i dag',
  ok: 'OK',
  clear: 'Ryd',
  week: 'Uge',
  month: 'Måned',
  year: 'År',
  timeSelect: 'Vælg tidspunkt',
  dateSelect: 'Vælg dato',
  monthSelect: 'Vælg måned',
  yearSelect: 'Vælg år',
  decadeSelect: 'Vælg årti',

  previousMonth: 'Forrige måned',
  nextMonth: 'Næste måned',
  previousYear: 'Forrige år',
  nextYear: 'Næste år',
  previousDecade: 'Forrige årti',
  nextDecade: 'Næste årti',
  previousCentury: 'Forrige århundrede',
  nextCentury: 'Næste århundrede',
};

export default locale;

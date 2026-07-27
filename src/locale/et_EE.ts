import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'et_EE',
  today: 'Täna',
  now: 'Praegu',
  backToToday: 'Tagasi tänase juurde',
  ok: 'OK',
  clear: 'Tühista',
  week: 'Nädal',
  month: 'Kuu',
  year: 'Aasta',
  timeSelect: 'Vali aeg',
  dateSelect: 'Vali kuupäev',
  monthSelect: 'Vali kuu',
  yearSelect: 'Vali aasta',
  decadeSelect: 'Vali dekaad',

  previousMonth: 'Eelmine kuu',
  nextMonth: 'Järgmine kuu',
  previousYear: 'Eelmine aasta',
  nextYear: 'Järgmine aasta',
  previousDecade: 'Eelmine dekaad',
  nextDecade: 'Järgmine dekaad',
  previousCentury: 'Eelmine sajand',
  nextCentury: 'Järgmine sajand',
};

export default locale;

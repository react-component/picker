import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'ca_ES',
  today: 'Avui',
  now: 'Ara',
  backToToday: 'Tornar a avui',
  ok: 'Acceptar',
  clear: 'Netejar',
  week: 'Setmana',
  month: 'Mes',
  year: 'Any',
  hours: 'Hores',
  minutes: 'Minuts',
  seconds: 'Segons',
  milliseconds: 'Mil·lisegons',
  timeSelect: 'Seleccionar hora',
  dateSelect: 'Seleccionar data',
  monthSelect: 'Escollir un mes',
  yearSelect: 'Escollir un any',
  decadeSelect: 'Escollir una dècada',
  hourSelect: 'Seleccioneu una hora',
  minuteSelect: 'Seleccioneu un minut',
  secondSelect: 'Seleccioneu un segon',
  millisecondSelect: 'Seleccioneu un mil·lisegon',
  meridiemSelect: 'Seleccioneu el meridiem',
  previousMonth: 'Mes anterior',
  nextMonth: 'Mes següent',
  previousYear: 'Any anterior',
  nextYear: 'Mes següent',
  previousDecade: 'Dècada anterior',
  nextDecade: 'Dècada següent',
  previousCentury: 'Segle anterior',
  nextCentury: 'Segle següent',
};

export default locale;

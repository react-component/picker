import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'gl_ES',
  today: 'Hoxe',
  now: 'Agora',
  backToToday: 'Voltar a hoxe',
  ok: 'Aceptar',
  clear: 'Limpar',
  week: 'Semana',
  month: 'Mes',
  year: 'Ano',
  timeSelect: 'Seleccionar hora',
  dateSelect: 'Seleccionar data',
  monthSelect: 'Elexir un mes',
  yearSelect: 'Elexir un año',
  decadeSelect: 'Elexir unha década',

  previousMonth: 'Mes anterior',
  nextMonth: 'Mes seguinte',
  previousYear: 'Ano anterior',
  nextYear: 'Ano seguinte',
  previousDecade: 'Década anterior',
  nextDecade: 'Década seguinte',
  previousCentury: 'Século anterior',
  nextCentury: 'Século seguinte',
};

export default locale;

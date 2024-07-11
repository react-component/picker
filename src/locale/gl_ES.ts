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
  month: 'Mes',
  year: 'Ano',
  timeSelect: 'Seleccionar hora',
  dateSelect: 'Seleccionar data',
  monthSelect: 'Elexir un mes',
  yearSelect: 'Elexir un año',
  decadeSelect: 'Elexir unha década',

  dateFormat: 'D/M/YYYY',

  dateTimeFormat: 'D/M/YYYY HH:mm:ss',

  previousMonth: 'Mes anterior (PageUp)',
  nextMonth: 'Mes seguinte (PageDown)',
  previousYear: 'Ano anterior (Control + left)',
  nextYear: 'Ano seguinte (Control + right)',
  previousDecade: 'Década anterior',
  nextDecade: 'Década seguinte',
  previousCentury: 'Século anterior',
  nextCentury: 'Século seguinte',
};

export default locale;

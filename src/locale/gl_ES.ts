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
  hours: 'Horas',
  minutes: 'Minutos',
  seconds: 'Segundos',
  milliseconds: 'Milisegundos',
  timeSelect: 'Seleccionar hora',
  dateSelect: 'Seleccionar data',
  monthSelect: 'Elexir un mes',
  yearSelect: 'Elexir un año',
  decadeSelect: 'Elexir unha década',
  hourSelect: 'Seleccionar unha hora',
  minuteSelect: 'Seleccionar un minuto',
  secondSelect: 'Seleccionar un segundo',
  millisecondSelect: 'Seleccionar un milisegundo',
  meridiemSelect: 'Seleccionar meridiano',

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

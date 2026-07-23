import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'es_MX',
  today: 'Hoy',
  now: 'Ahora',
  backToToday: 'Volver a hoy',
  ok: 'Aceptar',
  clear: 'Limpiar',
  week: 'Semana',
  month: 'Mes',
  year: 'Año',
  hours: 'Horas',
  minutes: 'Minutos',
  seconds: 'Segundos',
  milliseconds: 'Milisegundos',
  timeSelect: 'elegir hora',
  dateSelect: 'elegir fecha',
  weekSelect: 'elegir semana',
  monthSelect: 'Seleccionar mes',
  yearSelect: 'Seleccionar año',
  decadeSelect: 'Seleccionar década',
  hourSelect: 'Seleccionar una hora',
  minuteSelect: 'Seleccionar un minuto',
  secondSelect: 'Seleccionar un segundo',
  millisecondSelect: 'Seleccionar un milisegundo',
  meridiemSelect: 'Seleccionar meridiem',

  previousMonth: 'Mes anterior',
  nextMonth: 'Mes siguiente',
  previousYear: 'Año anterior',
  nextYear: 'Año siguiente',
  previousDecade: 'Década anterior',
  nextDecade: 'Década siguiente',
  previousCentury: 'Siglo anterior',
  nextCentury: 'Siglo siguiente',
};

export default locale;

import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'pt_PT',
  today: 'Hoje',
  now: 'Agora',
  backToToday: 'Hoje',
  ok: 'OK',
  clear: 'Limpar',
  week: 'Semana',
  month: 'Mês',
  year: 'Ano',
  hours: 'Horas',
  minutes: 'Minutos',
  seconds: 'Segundos',
  milliseconds: 'Milissegundos',
  timeSelect: 'Selecionar hora',
  dateSelect: 'Selecionar data',
  monthSelect: 'Selecionar mês',
  yearSelect: 'Selecionar ano',
  decadeSelect: 'Selecionar década',
  hourSelect: 'Selecionar uma hora',
  minuteSelect: 'Selecionar um minuto',
  secondSelect: 'Selecionar um segundo',
  millisecondSelect: 'Selecionar um milissegundo',
  meridiemSelect: 'Selecionar meridiem',

  previousMonth: 'Mês anterior',
  nextMonth: 'Mês seguinte',
  previousYear: 'Ano anterior',
  nextYear: 'Ano seguinte',
  previousDecade: 'Década anterior',
  nextDecade: 'Década seguinte',
  previousCentury: 'Século anterior',
  nextCentury: 'Século seguinte',
  shortWeekDays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  shortMonths: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
};

export default locale;

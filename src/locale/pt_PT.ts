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
  timeSelect: 'Selecionar hora',
  dateSelect: 'Selecionar data',
  monthSelect: 'Selecionar mês',
  yearSelect: 'Selecionar ano',
  decadeSelect: 'Selecionar década',

  previousMonth: 'Mês anterior (PageUp)',
  nextMonth: 'Mês seguinte (PageDown)',
  previousYear: 'Ano anterior (Control + left)',
  nextYear: 'Ano seguinte (Control + right)',
  previousDecade: 'Década anterior',
  nextDecade: 'Década seguinte',
  previousCentury: 'Século anterior',
  nextCentury: 'Século seguinte',
  shortWeekDays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  shortMonths: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
};

export default locale;

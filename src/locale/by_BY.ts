import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'by_BY',
  today: 'Сёння',
  now: 'Зараз',
  backToToday: 'Дадзеная дата',
  ok: 'OK',
  clear: 'Ачысціць',
  week: 'Тыдзень',
  month: 'Месяц',
  year: 'Год',
  hours: 'Гадзіны',
  minutes: 'Хвіліны',
  seconds: 'Секунды',
  milliseconds: 'Мілісекунды',
  timeSelect: 'Выбраць час',
  dateSelect: 'Выбраць дату',
  weekSelect: 'Выбраць тыдзень',
  monthSelect: 'Выбраць месяц',
  yearSelect: 'Выбраць год',
  decadeSelect: 'Выбраць дзесяцігоддзе',
  hourSelect: 'Выберыце гадзіну',
  minuteSelect: 'Выберыце хвіліну',
  secondSelect: 'Выберыце секунду',
  millisecondSelect: 'Выберыце мілісекунду',
  meridiemSelect: 'Выберыце мерыдыем',

  previousMonth: 'Папярэдні месяц (PageUp)',
  nextMonth: 'Наступны месяц (PageDown)',
  previousYear: 'Папярэдні год (Control + left)',
  nextYear: 'Наступны год (Control + right)',
  previousDecade: 'Папярэдняе дзесяцігоддзе',
  nextDecade: 'Наступнае дзесяцігоддзе',
  previousCentury: 'Папярэдні век',
  nextCentury: 'Наступны век',
};

export default locale;

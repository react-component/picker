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

  previousMonth: 'Папярэдні месяц',
  nextMonth: 'Наступны месяц',
  previousYear: 'Папярэдні год',
  nextYear: 'Наступны год',
  previousDecade: 'Папярэдняе дзесяцігоддзе',
  nextDecade: 'Наступнае дзесяцігоддзе',
  previousCentury: 'Папярэдні век',
  nextCentury: 'Наступны век',
};

export default locale;

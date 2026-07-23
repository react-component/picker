import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'uk_UA',
  today: 'Сьогодні',
  now: 'Зараз',
  backToToday: 'Поточна дата',
  ok: 'OK',
  clear: 'Очистити',
  week: 'Тиждень',
  month: 'Місяць',
  year: 'Рік',
  hours: 'Години',
  minutes: 'Хвилини',
  seconds: 'Секунди',
  milliseconds: 'Мілісекунди',
  timeSelect: 'Обрати час',
  dateSelect: 'Обрати дату',
  monthSelect: 'Обрати місяць',
  yearSelect: 'Обрати рік',
  decadeSelect: 'Обрати десятиріччя',
  hourSelect: 'Виберіть годину',
  minuteSelect: 'Виберіть хвилину',
  secondSelect: 'Виберіть секунду',
  millisecondSelect: 'Виберіть мілісекунду',
  meridiemSelect: 'Виберіть меридієм',

  previousMonth: 'Попередній місяць',
  nextMonth: 'Наступний місяць',
  previousYear: 'Попередній рік',
  nextYear: 'Наступний рік',
  previousDecade: 'Попереднє десятиріччя',
  nextDecade: 'Наступне десятиріччя',
  previousCentury: 'Попереднє століття',
  nextCentury: 'Наступне століття',
};

export default locale;

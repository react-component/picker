import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'ru_RU',
  today: 'Сегодня',
  now: 'Сейчас',
  backToToday: 'Текущая дата',
  ok: 'ОК',
  clear: 'Очистить',
  week: 'Неделя',
  month: 'Месяц',
  year: 'Год',
  hours: 'Часы',
  minutes: 'Минуты',
  seconds: 'Секунды',
  milliseconds: 'Миллисекунды',
  timeSelect: 'Выбрать время',
  dateSelect: 'Выбрать дату',
  monthSelect: 'Выбрать месяц',
  yearSelect: 'Выбрать год',
  decadeSelect: 'Выбрать десятилетие',
  hourSelect: 'Выберите час',
  minuteSelect: 'Выберите минуту',
  secondSelect: 'Выберите секунду',
  millisecondSelect: 'Выберите миллисекунду',
  meridiemSelect: 'Выберите меридием',

  previousMonth: 'Предыдущий месяц',
  nextMonth: 'Следующий месяц',
  previousYear: 'Предыдущий год',
  nextYear: 'Следующий год',
  previousDecade: 'Предыдущее десятилетие',
  nextDecade: 'Следущее десятилетие',
  previousCentury: 'Предыдущий век',
  nextCentury: 'Следующий век',
};

export default locale;

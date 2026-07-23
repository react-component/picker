import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'kk_KZ',
  today: 'Бүгін',
  now: 'Қазір',
  backToToday: 'Ағымдағы күн',
  ok: 'Таңдау',
  clear: 'Таза',
  week: 'Апта',
  month: 'Ай',
  year: 'Жыл',
  hours: 'Сағат',
  minutes: 'Минут',
  seconds: 'Секунд',
  milliseconds: 'Миллисекунд',
  timeSelect: 'Уақытты таңдау',
  dateSelect: 'Күнді таңдау',
  monthSelect: 'Айды таңдаңыз',
  yearSelect: 'Жылды таңдаңыз',
  decadeSelect: 'Онжылды таңдаңыз',
  hourSelect: 'Сағатты таңдаңыз',
  minuteSelect: 'Минутты таңдаңыз',
  secondSelect: 'Секундты таңдаңыз',
  millisecondSelect: 'Миллисекундты таңдаңыз',
  meridiemSelect: 'Меридиемді таңдаңыз',

  previousMonth: 'Алдыңғы ай',
  nextMonth: 'Келесі ай',
  previousYear: 'Алдыңғы жыл',
  nextYear: 'Келесі жыл',
  previousDecade: 'Алдыңғы онжылдық',
  nextDecade: 'Келесі онжылдық',
  previousCentury: 'Алдыңғы ғасыр',
  nextCentury: 'Келесі ғасыр',
};

export default locale;

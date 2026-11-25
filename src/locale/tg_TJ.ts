import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'tg_TJ',
  today: 'Имрӯз',
  now: 'Ҳозир',
  backToToday: 'Бозгашт ба имрӯз',
  ok: 'ХУБ',
  clear: 'Пок кардан',
  week: 'Ҳафта',
  month: 'Моҳ',
  year: 'Сол',
  timeSelect: 'Вақтро интихоб кунед',
  dateSelect: 'Санаро интихоб кунед',
  weekSelect: 'Ҳафтаро интихоб кунед',
  monthSelect: 'Моҳро интихоб кунед',
  yearSelect: 'Солро интихоб кунед',
  decadeSelect: 'Даҳсоларо интихоб кунед',
  hourSelect: 'Соатро интихоб кунед',
  minuteSelect: 'Дақиқаро интихоб кунед',
  secondSelect: 'Сонияро интихоб кунед',
  millisecondSelect: 'Миллисонияро интихоб кунед',
  meridiemSelect: 'AM/PM-ро интихоб кунед',

  previousMonth: 'Моҳи гузашта',
  nextMonth: 'Моҳи оянда',
  previousYear: 'Соли гузашта',
  nextYear: 'Соли оянда',
  previousDecade: 'Даҳсолаи гузашта',
  nextDecade: 'Даҳсолаи оянда',
  previousCentury: 'Асри гузашта',
  nextCentury: 'Асри оянда',
};

export default locale;

import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'mn_MN',
  today: 'Өнөөдөр',
  now: 'Одоо',
  backToToday: 'Өнөөдөрлүү буцах',
  ok: 'OK',
  clear: 'Цэвэрлэх',
  week: 'Долоо хоног',
  month: 'Сар',
  year: 'Жил',
  timeSelect: 'Цаг сонгох',
  dateSelect: 'Огноо сонгох',
  weekSelect: '7 хоног сонгох',
  monthSelect: 'Сар сонгох',
  yearSelect: 'Жил сонгох',
  decadeSelect: 'Арван сонгох',

  dayFormat: 'DD',

  previousMonth: 'Өмнөх сар',
  nextMonth: 'Дараа сар',
  previousYear: 'Өмнөх жил',
  nextYear: 'Дараа жил',
  previousDecade: 'Өмнөх арван',
  nextDecade: 'Дараа арван',
  previousCentury: 'Өмнөх зуун',
  nextCentury: 'Дараа зуун',
};

export default locale;

import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'ar_EG',
  today: 'اليوم',
  now: 'الأن',
  backToToday: 'العودة إلى اليوم',
  ok: 'تأكيد',
  clear: 'مسح',
  week: 'الأسبوع',
  month: 'الشهر',
  year: 'السنة',
  timeSelect: 'اختيار الوقت',
  dateSelect: 'اختيار التاريخ',
  monthSelect: 'اختيار الشهر',
  yearSelect: 'اختيار السنة',
  decadeSelect: 'اختيار العقد',
  previousMonth: 'الشهر السابق',
  nextMonth: 'الشهر التالى',
  previousYear: 'العام السابق',
  nextYear: 'العام التالى',
  previousDecade: 'العقد السابق',
  nextDecade: 'العقد التالى',
  previousCentury: 'القرن السابق',
  nextCentury: 'القرن التالى',
};

export default locale;

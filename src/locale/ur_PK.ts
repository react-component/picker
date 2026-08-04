import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'ur_PK',
  today: 'آج',
  now: 'ابھی',
  backToToday: 'آج واپس',
  ok: 'ٹھیک ہے',
  clear: 'صاف',
  week: 'ہفتہ',
  month: 'مہینہ',
  year: 'سال',
  hours: 'گھنٹے',
  minutes: 'منٹ',
  seconds: 'سیکنڈ',
  milliseconds: 'ملی سیکنڈ',
  timeSelect: 'وقت منتخب کریں',
  dateSelect: 'تاریخ منتخب کریں',
  weekSelect: 'ایک ہفتہ کا انتخاب کریں',
  monthSelect: 'ایک مہینہ کا انتخاب کریں',
  yearSelect: 'ایک سال کا انتخاب کریں',
  decadeSelect: 'ایک دہائی کا انتخاب کریں',
  hourSelect: 'ایک گھنٹہ منتخب کریں',
  minuteSelect: 'ایک منٹ منتخب کریں',
  secondSelect: 'ایک سیکنڈ منتخب کریں',
  millisecondSelect: 'ایک ملی سیکنڈ منتخب کریں',
  meridiemSelect: 'صبح/شام منتخب کریں',

  previousMonth: 'پچھلے مہینے',
  nextMonth: 'اگلے مہینے',
  previousYear: 'گزشتہ سال',
  nextYear: 'اگلے سال',
  previousDecade: 'پچھلی دہائی',
  nextDecade: 'اگلی دہائی',
  previousCentury: 'پچھلی صدی',
  nextCentury: 'اگلی صدی',
};

export default locale;

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
  month: 'مہینہ',
  year: 'سال',
  timeSelect: 'وقت منتخب کریں',
  dateSelect: 'تاریخ منتخب کریں',
  weekSelect: 'ایک ہفتہ کا انتخاب کریں',
  monthSelect: 'ایک مہینہ کا انتخاب کریں',
  yearSelect: 'ایک سال کا انتخاب کریں',
  decadeSelect: 'ایک دہائی کا انتخاب کریں',

  dateFormat: 'M/D/YYYY',

  dateTimeFormat: 'M/D/YYYY HH:mm:ss',

  previousMonth: 'پچھلے مہینے (PageUp)',
  nextMonth: 'اگلے مہینے (PageDown)',
  previousYear: 'گزشتہ سال (Control + left)',
  nextYear: 'اگلے سال (Control + right)',
  previousDecade: 'پچھلی دہائی',
  nextDecade: 'اگلی دہائی',
  previousCentury: 'پچھلی صدی',
  nextCentury: 'اگلی صدی',
};

export default locale;

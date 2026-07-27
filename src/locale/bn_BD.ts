import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'bn_BD',
  today: 'আজ',
  now: 'এখন',
  backToToday: 'আজকে ফিরে চলুন',
  ok: 'ওকে',
  clear: 'পরিস্কার',
  week: 'সপ্তাহ',
  month: 'মাস',
  year: 'বছর',
  timeSelect: 'সময় নির্বাচন',
  dateSelect: 'তারিখ নির্বাচন',
  weekSelect: 'সপ্তাহ পছন্দ করুন',
  monthSelect: 'মাস পছন্দ করুন',
  yearSelect: 'বছর পছন্দ করুন',
  decadeSelect: 'একটি দশক পছন্দ করুন',
  previousMonth: 'গত মাস',
  nextMonth: 'আগামী মাস',
  previousYear: 'গত বছর',
  nextYear: 'আগামী বছর',
  previousDecade: 'গত দশক',
  nextDecade: 'পরের দশক',
  previousCentury: 'গত শতাব্দী',
  nextCentury: 'পরের শতাব্দী',
};

export default locale;

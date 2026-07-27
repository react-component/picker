import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'uz_UZ',
  today: 'Bugun',
  now: 'Hozir',
  backToToday: 'Bugunga qaytish',
  ok: 'OK',
  clear: 'Toza',
  week: 'Xafta',
  month: 'Oy',
  year: 'Yil',
  timeSelect: 'vaqtni tanlang',
  dateSelect: 'sanani tanlang',
  weekSelect: 'Haftani tanlang',
  monthSelect: 'Oyni tanlang',
  yearSelect: 'Yilni tanlang',
  decadeSelect: "O'n yilni tanlang",
  previousMonth: 'Oldingi oy',
  nextMonth: 'Keyingi oy',
  previousYear: "O'tgan yili",
  nextYear: 'Keyingi yil',
  previousDecade: "Oxirgi o'n yil",
  nextDecade: "Keyingi o'n yil",
  previousCentury: "O'tgan asr",
  nextCentury: 'Keyingi asr',
};

export default locale;

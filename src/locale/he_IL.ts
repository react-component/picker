import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'he_IL',
  today: 'היום',
  now: 'עכשיו',
  backToToday: 'חזור להיום',
  ok: 'אישור',
  clear: 'איפוס',
  month: 'חודש',
  year: 'שנה',
  timeSelect: 'בחר שעה',
  dateSelect: 'בחר תאריך',
  weekSelect: 'בחר שבוע',
  monthSelect: 'בחר חודש',
  yearSelect: 'בחר שנה',
  decadeSelect: 'בחר עשור',

  dateFormat: 'M/D/YYYY',

  dateTimeFormat: 'M/D/YYYY HH:mm:ss',

  previousMonth: 'חודש קודם (PageUp)',
  nextMonth: 'חודש הבא (PageDown)',
  previousYear: 'שנה שעברה (Control + left)',
  nextYear: 'שנה הבאה (Control + right)',
  previousDecade: 'העשור הקודם',
  nextDecade: 'העשור הבא',
  previousCentury: 'המאה הקודמת',
  nextCentury: 'המאה הבאה',
};

export default locale;

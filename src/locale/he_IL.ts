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
  week: 'שבוע',
  month: 'חודש',
  year: 'שנה',
  timeSelect: 'בחר שעה',
  dateSelect: 'בחר תאריך',
  weekSelect: 'בחר שבוע',
  monthSelect: 'בחר חודש',
  yearSelect: 'בחר שנה',
  decadeSelect: 'בחר עשור',

  previousMonth: 'חודש קודם',
  nextMonth: 'חודש הבא',
  previousYear: 'שנה שעברה',
  nextYear: 'שנה הבאה',
  previousDecade: 'העשור הקודם',
  nextDecade: 'העשור הבא',
  previousCentury: 'המאה הקודמת',
  nextCentury: 'המאה הבאה',
};

export default locale;

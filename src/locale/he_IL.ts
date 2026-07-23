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
  hours: 'שעות',
  minutes: 'דקות',
  seconds: 'שניות',
  milliseconds: 'מילישניות',
  timeSelect: 'בחר שעה',
  dateSelect: 'בחר תאריך',
  weekSelect: 'בחר שבוע',
  monthSelect: 'בחר חודש',
  yearSelect: 'בחר שנה',
  decadeSelect: 'בחר עשור',
  hourSelect: 'בחר שעה',
  minuteSelect: 'בחר דקה',
  secondSelect: 'בחר שנייה',
  millisecondSelect: 'בחר מילישנייה',
  meridiemSelect: 'בחר לפני/אחרי הצהריים',

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

import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'ug_CN',
  today: 'بۈگۈن',
  now: 'ھازىر',
  backToToday: 'بۈگۈنگە قايتىش',
  ok: 'مۇقىملاشتۇرۇش',
  timeSelect: 'ۋاقىت تاللاش',
  dateSelect: 'كۈن تاللاش',
  clear: 'تازىلاش',
  week: 'ھەپتە',
  month: 'ئاي',
  year: 'يىل',
  previousMonth: 'ئالدىنقى ئاي',
  nextMonth: 'كېلەر ئاي',
  monthSelect: 'ئاي تاللاش',
  yearSelect: 'يىل تاللاش',
  decadeSelect: 'يىللارنى تاللاش',
  yearFormat: 'YYYY-يىلى',
  dayFormat: 'D-كۈنى',
  previousYear: 'ئالدىنقى يىلى',
  nextYear: 'كېلەركى يىلى',
  previousDecade: 'ئالدىنقى يىللار',
  nextDecade: 'كېيىنكى يىللار',
  previousCentury: 'ئالدىنقى ئەسىر',
  nextCentury: 'كېيىنكى ئەسىر',
  monthBeforeYear: false,
};

export default locale;

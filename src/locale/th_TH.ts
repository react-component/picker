import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'th_TH',
  today: 'วันนี้',
  now: 'ตอนนี้',
  backToToday: 'กลับไปยังวันนี้',
  ok: 'ตกลง',
  clear: 'ลบล้าง',
  week: 'สัปดาห์',
  month: 'เดือน',
  year: 'ปี',
  timeSelect: 'เลือกเวลา',
  dateSelect: 'เลือกวัน',
  monthSelect: 'เลือกเดือน',
  yearSelect: 'เลือกปี',
  decadeSelect: 'เลือกทศวรรษ',

  previousMonth: 'เดือนก่อนหน้า',
  nextMonth: 'เดือนถัดไป',
  previousYear: 'ปีก่อนหน้า',
  nextYear: 'ปีถัดไป',
  previousDecade: 'ทศวรรษก่อนหน้า',
  nextDecade: 'ทศวรรษถัดไป',
  previousCentury: 'ศตวรรษก่อนหน้า',
  nextCentury: 'ศตวรรษถัดไป',
};

export default locale;

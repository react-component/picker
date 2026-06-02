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
  hours: 'ชั่วโมง',
  minutes: 'นาที',
  seconds: 'วินาที',
  milliseconds: 'มิลลิวินาที',
  timeSelect: 'เลือกเวลา',
  dateSelect: 'เลือกวัน',
  monthSelect: 'เลือกเดือน',
  yearSelect: 'เลือกปี',
  decadeSelect: 'เลือกทศวรรษ',
  hourSelect: 'เลือกชั่วโมง',
  minuteSelect: 'เลือกนาที',
  secondSelect: 'เลือกวินาที',
  millisecondSelect: 'เลือกมิลลิวินาที',
  meridiemSelect: 'เลือกช่วงวัน',

  previousMonth: 'เดือนก่อนหน้า (PageUp)',
  nextMonth: 'เดือนถัดไป (PageDown)',
  previousYear: 'ปีก่อนหน้า (Control + left)',
  nextYear: 'ปีถัดไป (Control + right)',
  previousDecade: 'ทศวรรษก่อนหน้า',
  nextDecade: 'ทศวรรษถัดไป',
  previousCentury: 'ศตวรรษก่อนหน้า',
  nextCentury: 'ศตวรรษถัดไป',
};

export default locale;

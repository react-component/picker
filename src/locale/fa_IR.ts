import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'fa_IR',
  today: 'امروز',
  now: 'اکنون',
  backToToday: 'بازگشت به روز',
  ok: 'باشه',
  clear: 'پاک کردن',
  week: 'هفته',
  month: 'ماه',
  year: 'سال',
  hours: 'ساعت',
  minutes: 'دقیقه',
  seconds: 'ثانیه',
  milliseconds: 'میلی‌ثانیه',
  timeSelect: 'انتخاب زمان',
  dateSelect: 'انتخاب تاریخ',
  monthSelect: 'یک ماه را انتخاب کنید',
  yearSelect: 'یک سال را انتخاب کنید',
  decadeSelect: 'یک دهه را انتخاب کنید',
  hourSelect: 'انتخاب ساعت',
  minuteSelect: 'انتخاب دقیقه',
  secondSelect: 'انتخاب ثانیه',
  millisecondSelect: 'انتخاب میلی‌ثانیه',
  meridiemSelect: 'انتخاب قبل/بعد از ظهر',

  previousMonth: 'ماه قبل',
  nextMonth: 'ماه بعد',
  previousYear: 'سال قبل',
  nextYear: 'سال بعد',
  previousDecade: 'دهه قبل',
  nextDecade: 'دهه بعد',
  previousCentury: 'قرن قبل',
  nextCentury: 'قرن بعد',
};

export default locale;

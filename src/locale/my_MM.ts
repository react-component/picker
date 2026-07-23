import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'my_MM',
  today: 'ယနေ့',
  now: 'ယခု',
  backToToday: 'ယနေ့မတိုင်ခင်သို့',
  ok: 'OK',
  clear: 'ရှင်းမည်',
  week: 'အပတ်',
  month: 'လ',
  year: 'နှစ်',
  hours: 'နာရီ',
  minutes: 'မိနစ်',
  seconds: 'စက္ကန့်',
  milliseconds: 'မီလီစက္ကန့်',
  timeSelect: 'အချိန်ကိုရွေး',
  dateSelect: 'နေ့ကိုရွေး',
  weekSelect: 'သီတင်းပတ်ကိုရွေး',
  monthSelect: 'လကိုရွေး',
  yearSelect: 'နှစ်ကိုရွေး',
  decadeSelect: 'ဆယ်စုနှစ်ကိုရွေး',
  hourSelect: 'နာရီ ရွေးချယ်ပါ',
  minuteSelect: 'မိနစ် ရွေးချယ်ပါ',
  secondSelect: 'စက္ကန့် ရွေးချယ်ပါ',
  millisecondSelect: 'မီလီစက္ကန့် ရွေးချယ်ပါ',
  meridiemSelect: 'မေရီဒီယမ် ရွေးချယ်ပါ',

  previousMonth: 'ယခင်လ',
  nextMonth: 'နောက်လ',
  previousYear: 'ယခင်နှစ်',
  nextYear: 'နောက်နှစ်',
  previousDecade: 'ယခင်ဆယ်စုနှစ်',
  nextDecade: 'နောက်ဆယ်စုနှစ်',
  previousCentury: 'ယခင်ရာစုနှစ်',
  nextCentury: 'နောက်ရာစုနှစ်',
};

export default locale;

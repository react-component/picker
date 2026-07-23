import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'ne_NP',
  today: 'आज',
  now: 'अब',
  backToToday: 'आज फर्कनुहोस्',
  ok: 'ठिक छ',
  clear: 'खाली गर्नुहोस्',
  week: 'हप्ता',
  month: 'महिना',
  year: 'वर्ष',
  hours: 'घण्टाहरू',
  minutes: 'मिनेटहरू',
  seconds: 'सेकेन्डहरू',
  milliseconds: 'मिलिसेकेन्डहरू',
  timeSelect: 'समय चयन गर्नुहोस्',
  dateSelect: 'मिति चयन गर्नुहोस्',
  weekSelect: 'एक हप्ता छान्नुहोस्',
  monthSelect: 'एक महिना छान्नुहोस्',
  yearSelect: 'एक वर्ष छान्नुहोस्',
  decadeSelect: 'एक दशक छान्नुहोस्',
  hourSelect: 'एउटा घण्टा छान्नुहोस्',
  minuteSelect: 'एउटा मिनेट छान्नुहोस्',
  secondSelect: 'एउटा सेकेन्ड छान्नुहोस्',
  millisecondSelect: 'एउटा मिलिसेकेन्ड छान्नुहोस्',
  meridiemSelect: 'मेरिडियम छान्नुहोस्',

  previousMonth: 'अघिल्लो महिना',
  nextMonth: 'अर्को महिना',
  previousYear: 'गत वर्ष',
  nextYear: 'आउने साल',
  previousDecade: 'पछिल्लो दशक',
  nextDecade: 'अर्को दशक',
  previousCentury: 'पछिल्लो शताब्दी',
  nextCentury: 'अर्को शताब्दी',
};

export default locale;

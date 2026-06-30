import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'ml_IN',
  today: 'ഇന്ന്',
  now: 'ഇപ്പോൾ',
  backToToday: 'ഇന്നത്തെ ദിവസത്തിലേക്ക് തിരിച്ചു പോകുക',
  ok: 'ശരിയാണ്',
  clear: 'നീക്കം ചെയ്യുക',
  week: 'ആഴ്ച',
  month: 'മാസം',
  year: 'വർഷം',
  timeSelect: 'സമയം തിരഞ്ഞെടുക്കുക',
  dateSelect: 'ദിവസം തിരഞ്ഞെടുക്കുക',
  weekSelect: 'വാരം തിരഞ്ഞെടുക്കുക',
  monthSelect: 'മാസം തിരഞ്ഞെടുക്കുക',
  yearSelect: 'വർഷം തിരഞ്ഞെടുക്കുക',
  decadeSelect: 'ദശാബ്ദം തിരഞ്ഞെടുക്കുക',

  previousMonth: 'കഴിഞ്ഞ മാസം',
  nextMonth: 'അടുത്ത മാസം',
  previousYear: 'കഴിഞ്ഞ വർഷം',
  nextYear: 'അടുത്ത വർഷം',
  previousDecade: 'കഴിഞ്ഞ ദശാബ്ദം',
  nextDecade: 'അടുത്ത ദശാബ്ദം',
  previousCentury: 'കഴിഞ്ഞ നൂറ്റാണ്ട്',
  nextCentury: 'അടുത്ത നൂറ്റാണ്ട്',
};

export default locale;

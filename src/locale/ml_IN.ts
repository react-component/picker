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
  hours: 'മണിക്കൂറുകൾ',
  minutes: 'മിനിറ്റുകൾ',
  seconds: 'സെക്കൻഡുകൾ',
  milliseconds: 'മില്ലിസെക്കൻഡുകൾ',
  timeSelect: 'സമയം തിരഞ്ഞെടുക്കുക',
  dateSelect: 'ദിവസം തിരഞ്ഞെടുക്കുക',
  weekSelect: 'വാരം തിരഞ്ഞെടുക്കുക',
  monthSelect: 'മാസം തിരഞ്ഞെടുക്കുക',
  yearSelect: 'വർഷം തിരഞ്ഞെടുക്കുക',
  decadeSelect: 'ദശാബ്ദം തിരഞ്ഞെടുക്കുക',
  hourSelect: 'ഒരു മണിക്കൂർ തിരഞ്ഞെടുക്കുക',
  minuteSelect: 'ഒരു മിനിറ്റ് തിരഞ്ഞെടുക്കുക',
  secondSelect: 'ഒരു സെക്കൻഡ് തിരഞ്ഞെടുക്കുക',
  millisecondSelect: 'ഒരു മില്ലിസെക്കൻഡ് തിരഞ്ഞെടുക്കുക',
  meridiemSelect: 'മെറിഡിയം തിരഞ്ഞെടുക്കുക',

  previousMonth: 'കഴിഞ്ഞ മാസം (PageUp)',
  nextMonth: 'അടുത്ത മാസം (PageDown)',
  previousYear: 'കഴിഞ്ഞ വർഷം (Control + left)',
  nextYear: 'അടുത്ത വർഷം (Control + right)',
  previousDecade: 'കഴിഞ്ഞ ദശാബ്ദം',
  nextDecade: 'അടുത്ത ദശാബ്ദം',
  previousCentury: 'കഴിഞ്ഞ നൂറ്റാണ്ട്',
  nextCentury: 'അടുത്ത നൂറ്റാണ്ട്',
};

export default locale;

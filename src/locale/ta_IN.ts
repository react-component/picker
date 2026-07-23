import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'ta_IN',
  today: 'இன்று',
  now: 'இப்போது',
  backToToday: 'இன்றுக்கு திரும்பு',
  ok: 'சரி',
  clear: 'அழி',
  week: 'வாரம்',
  month: 'மாதம்',
  year: 'வருடம்',
  hours: 'மணிநேரங்கள்',
  minutes: 'நிமிடங்கள்',
  seconds: 'வினாடிகள்',
  milliseconds: 'மில்லி வினாடிகள்',
  timeSelect: 'நேரத்தைத் தேர்ந்தெடு',
  dateSelect: 'தேதியைத் தேர்ந்தெடு',
  weekSelect: 'வாரத்தைத் தேர்வுசெய்க',
  monthSelect: 'மாதத்தைத் தேர்வுசெய்க',
  yearSelect: 'வருடத்தைத் தேர்வுசெய்க',
  decadeSelect: 'தசாப்தத்தைத் தேர்வுசெய்க',
  hourSelect: 'ஒரு மணிநேரம் தேர்ந்தெடுக்கவும்',
  minuteSelect: 'ஒரு நிமிடம் தேர்ந்தெடுக்கவும்',
  secondSelect: 'ஒரு வினாடி தேர்ந்தெடுக்கவும்',
  millisecondSelect: 'ஒரு மில்லி வினாடி தேர்ந்தெடுக்கவும்',
  meridiemSelect: 'மெரிடியம் தேர்ந்தெடுக்கவும்',

  previousMonth: 'முந்தைய மாதம்',
  nextMonth: 'அடுத்த மாதம்',
  previousYear: 'முந்தைய வருடம்',
  nextYear: 'அடுத்த வருடம்',
  previousDecade: 'முந்தைய தசாப்தம்',
  nextDecade: 'அடுத்த தசாப்தம்',
  previousCentury: 'முந்தைய நூற்றாண்டு',
  nextCentury: 'அடுத்த நூற்றாண்டு',
};

export default locale;

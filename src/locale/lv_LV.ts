import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'lv_LV',
  today: 'Šodien',
  now: 'Tagad',
  backToToday: 'Atpakaļ pie šodienas',
  ok: 'OK',
  clear: 'Skaidrs',
  week: 'Nedēļa',
  month: 'Mēnesis',
  year: 'Gads',
  hours: 'Stundas',
  minutes: 'Minūtes',
  seconds: 'Sekundes',
  milliseconds: 'Milisekundes',
  timeSelect: 'Izvēlieties laiku',
  dateSelect: 'Izvēlieties datumu',
  monthSelect: 'Izvēlieties mēnesi',
  yearSelect: 'Izvēlieties gadu',
  decadeSelect: 'Izvēlieties desmit gadus',
  hourSelect: 'Atlasiet stundu',
  minuteSelect: 'Atlasiet minūti',
  secondSelect: 'Atlasiet sekundi',
  millisecondSelect: 'Atlasiet milisekundi',
  meridiemSelect: 'Atlasiet meridiemu',

  previousMonth: 'Iepriekšējais mēnesis',
  nextMonth: 'Nākammēnes',
  previousYear: 'Pagājušais gads',
  nextYear: 'Nākamgad',
  previousDecade: 'Pēdējā desmitgadē',
  nextDecade: 'Nākamā desmitgade',
  previousCentury: 'Pagājušajā gadsimtā',
  nextCentury: 'Nākamajā gadsimtā',
};

export default locale;

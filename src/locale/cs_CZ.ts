import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'cs_CZ',
  today: 'Dnes',
  now: 'Nyní',
  backToToday: 'Zpět na dnešek',
  ok: 'OK',
  clear: 'Vymazat',
  week: 'Týden',
  month: 'Měsíc',
  year: 'Rok',
  hours: 'Hodiny',
  minutes: 'Minuty',
  seconds: 'Sekundy',
  milliseconds: 'Milisekundy',
  timeSelect: 'Vybrat čas',
  dateSelect: 'Vybrat datum',
  monthSelect: 'Vyberte měsíc',
  yearSelect: 'Vyberte rok',
  decadeSelect: 'Vyberte dekádu',
  hourSelect: 'Vyberte hodinu',
  minuteSelect: 'Vyberte minutu',
  secondSelect: 'Vyberte sekundu',
  millisecondSelect: 'Vyberte milisekundu',
  meridiemSelect: 'Vyberte meridiem',

  previousMonth: 'Předchozí měsíc',
  nextMonth: 'Následující',
  previousYear: 'Předchozí rok',
  nextYear: 'Následující rok',
  previousDecade: 'Předchozí dekáda',
  nextDecade: 'Následující dekáda',
  previousCentury: 'Předchozí století',
  nextCentury: 'Následující století',
};

export default locale;

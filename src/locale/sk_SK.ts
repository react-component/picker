import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'sk_SK',
  today: 'Dnes',
  now: 'Teraz',
  backToToday: 'Späť na dnes',
  ok: 'OK',
  clear: 'Vymazať',
  week: 'Týždeň',
  month: 'Mesiac',
  year: 'Rok',
  hours: 'Hodiny',
  minutes: 'Minúty',
  seconds: 'Sekundy',
  milliseconds: 'Milisekundy',
  timeSelect: 'Vybrať čas',
  dateSelect: 'Vybrať dátum',
  monthSelect: 'Vybrať mesiac',
  yearSelect: 'Vybrať rok',
  decadeSelect: 'Vybrať dekádu',
  hourSelect: 'Vyberte hodinu',
  minuteSelect: 'Vyberte minútu',
  secondSelect: 'Vyberte sekundu',
  millisecondSelect: 'Vyberte milisekundu',
  meridiemSelect: 'Vyberte meridiem',

  previousMonth: 'Predchádzajúci mesiac (PageUp)',
  nextMonth: 'Nasledujúci mesiac (PageDown)',
  previousYear: 'Predchádzajúci rok (Control + left)',
  nextYear: 'Nasledujúci rok (Control + right)',
  previousDecade: 'Predchádzajúca dekáda',
  nextDecade: 'Nasledujúca dekáda',
  previousCentury: 'Predchádzajúce storočie',
  nextCentury: 'Nasledujúce storočie',
};

export default locale;

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
  timeSelect: 'Vybrať čas',
  dateSelect: 'Vybrať dátum',
  monthSelect: 'Vybrať mesiac',
  yearSelect: 'Vybrať rok',
  decadeSelect: 'Vybrať dekádu',

  previousMonth: 'Predchádzajúci mesiac',
  nextMonth: 'Nasledujúci mesiac',
  previousYear: 'Predchádzajúci rok',
  nextYear: 'Nasledujúci rok',
  previousDecade: 'Predchádzajúca dekáda',
  nextDecade: 'Nasledujúca dekáda',
  previousCentury: 'Predchádzajúce storočie',
  nextCentury: 'Nasledujúce storočie',
};

export default locale;

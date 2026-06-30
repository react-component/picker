import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'pl_PL',
  today: 'Dzisiaj',
  now: 'Teraz',
  backToToday: 'Ustaw dzisiaj',
  ok: 'OK',
  clear: 'Wyczyść',
  week: 'Tydzień',
  month: 'Miesiąc',
  year: 'Rok',
  timeSelect: 'Ustaw czas',
  dateSelect: 'Ustaw datę',
  monthSelect: 'Wybierz miesiąc',
  yearSelect: 'Wybierz rok',
  decadeSelect: 'Wybierz dekadę',

  previousMonth: 'Poprzedni miesiąc',
  nextMonth: 'Następny miesiąc',
  previousYear: 'Ostatni rok',
  nextYear: 'Następny rok',
  previousDecade: 'Ostatnia dekada',
  nextDecade: 'Następna dekada',
  previousCentury: 'Ostatni wiek',
  nextCentury: 'Następny wiek',
};

export default locale;

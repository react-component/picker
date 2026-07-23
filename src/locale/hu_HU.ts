import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'hu_HU',
  today: 'Ma', // 'Today',
  now: 'Most', // 'Now',
  backToToday: 'Vissza a mai napra', // 'Back to today',
  ok: 'OK',
  clear: 'Törlés', // 'Clear',
  week: 'Hét',
  month: 'Hónap', // 'Month',
  year: 'Év', // 'Year',
  hours: 'Óra',
  minutes: 'Perc',
  seconds: 'Másodperc',
  milliseconds: 'Ezredmásodperc',
  timeSelect: 'Időpont kiválasztása', // 'Select time',
  dateSelect: 'Dátum kiválasztása', // 'Select date',
  monthSelect: 'Hónap kiválasztása', // 'Choose a month',
  yearSelect: 'Év kiválasztása', // 'Choose a year',
  decadeSelect: 'Évtized kiválasztása', // 'Choose a decade',
  hourSelect: 'Válasszon órát',
  minuteSelect: 'Válasszon percet',
  secondSelect: 'Válasszon másodpercet',
  millisecondSelect: 'Válasszon ezredmásodpercet',
  meridiemSelect: 'Válasszon meridiémet',

  dayFormat: 'DD', // 'D',

  previousMonth: 'Előző hónap', // 'Previous month',
  nextMonth: 'Következő hónap', // 'Next month',
  previousYear: 'Múlt év', // 'Last year',
  nextYear: 'Jövő év', // 'Next year',
  previousDecade: 'Előző évtized', // 'Last decade',
  nextDecade: 'Következő évtized', // 'Next decade',
  previousCentury: 'Múlt évszázad', // 'Last century',
  nextCentury: 'Jövő évszázad', // 'Next century',
};

export default locale;

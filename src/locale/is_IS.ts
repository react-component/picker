import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'is_IS',
  today: 'Í dag',
  now: 'Núna',
  backToToday: 'Til baka til dagsins í dag',
  ok: 'Í lagi',
  clear: 'Hreinsa',
  week: 'Vika',
  month: 'Mánuður',
  year: 'Ár',
  hours: 'Klukkustundir',
  minutes: 'Mínútur',
  seconds: 'Sekúndur',
  milliseconds: 'Millisekúndur',
  timeSelect: 'Velja tíma',
  dateSelect: 'Velja dag',
  monthSelect: 'Velja mánuð',
  yearSelect: 'Velja ár',
  decadeSelect: 'Velja áratug',
  hourSelect: 'Veldu klukkustund',
  minuteSelect: 'Veldu mínútu',
  secondSelect: 'Veldu sekúndu',
  millisecondSelect: 'Veldu millisekúndu',
  meridiemSelect: 'Veldu hálf dags',

  previousMonth: 'Fyrri mánuður',
  nextMonth: 'Næsti mánuður',
  previousYear: 'Fyrra ár',
  nextYear: 'Næsta ár',
  previousDecade: 'Fyrri áratugur',
  nextDecade: 'Næsti áratugur',
  previousCentury: 'Fyrri öld',
  nextCentury: 'Næsta öld',
};

export default locale;

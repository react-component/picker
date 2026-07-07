import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'sl_SI',
  today: 'Danes',
  now: 'Trenutno',
  backToToday: 'Nazaj na danes',
  ok: 'V redu',
  clear: 'Počisti',
  week: 'Teden',
  month: 'Mesec',
  year: 'Leto',
  hours: 'Ure',
  minutes: 'Minute',
  seconds: 'Sekunde',
  milliseconds: 'Milisekunde',
  timeSelect: 'Izberite čas',
  dateSelect: 'Izberite datum',
  monthSelect: 'Izberite mesec',
  yearSelect: 'Izberite leto',
  decadeSelect: 'Izberite desetletje',
  hourSelect: 'Izberite uro',
  minuteSelect: 'Izberite minuto',
  secondSelect: 'Izberite sekundo',
  millisecondSelect: 'Izberite milisekundo',
  meridiemSelect: 'Izberite meridiem',

  previousMonth: 'Prejšnji mesec (PageUp)',
  nextMonth: 'Naslednji mesec (PageDown)',
  previousYear: 'Prejšnje leto (Control + left)',
  nextYear: 'Naslednje leto (Control + right)',
  previousDecade: 'Prejšnje desetletje',
  nextDecade: 'Naslednje desetletje',
  previousCentury: 'Prejšnje stoletje',
  nextCentury: 'Naslednje stoletje',
};

export default locale;

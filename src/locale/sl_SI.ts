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
  timeSelect: 'Izberite čas',
  dateSelect: 'Izberite datum',
  monthSelect: 'Izberite mesec',
  yearSelect: 'Izberite leto',
  decadeSelect: 'Izberite desetletje',

  previousMonth: 'Prejšnji mesec',
  nextMonth: 'Naslednji mesec',
  previousYear: 'Prejšnje leto',
  nextYear: 'Naslednje leto',
  previousDecade: 'Prejšnje desetletje',
  nextDecade: 'Naslednje desetletje',
  previousCentury: 'Prejšnje stoletje',
  nextCentury: 'Naslednje stoletje',
};

export default locale;

import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'tl_PH',
  today: 'Ngayon',
  now: 'Ngayon',
  backToToday: 'Bumalik sa ngayon',
  ok: 'OK',
  clear: 'Burahin',
  week: 'Linggo',
  month: 'Buwan',
  year: 'Taon',
  hours: 'Mga Oras',
  minutes: 'Mga Minuto',
  seconds: 'Mga Segundo',
  milliseconds: 'Mga Millisegundo',
  timeSelect: 'Pumili ng oras',
  dateSelect: 'Pumili ng petsa',
  weekSelect: 'Pumili ng linggo',
  monthSelect: 'Pumili ng buwan',
  yearSelect: 'Pumili ng taon',
  decadeSelect: 'Pumili ng dekada',
  hourSelect: 'Pumili ng isang oras',
  minuteSelect: 'Pumili ng isang minuto',
  secondSelect: 'Pumili ng isang segundo',
  millisecondSelect: 'Pumili ng isang millisegundo',
  meridiemSelect: 'Pumili ng meridiem',

  previousMonth: 'Nakaraang buwan (PageUp)',
  nextMonth: 'Susunod na buwan (PageDown)',
  previousYear: 'Nakaraang taon (Control + left)',
  nextYear: 'Susunod na taon (Control + right)',
  previousDecade: 'Nakaraang dekada',
  nextDecade: 'Susunod na dekada',
  previousCentury: 'Nakaraang siglo',
  nextCentury: 'Susunod na siglo',

  shortWeekDays: ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'],
  shortMonths: ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob', 'Dis'],
};

export default locale;

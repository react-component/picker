import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'ku',
  today: 'Îro',
  now: 'Niha',
  backToToday: 'Vegere îro',
  ok: 'Temam',
  clear: 'Paqij bike',
  week: 'Sêbê',
  month: 'Meh',
  year: 'Sal',
  hours: 'Saet',
  minutes: 'Deqîqe',
  seconds: 'Saniye',
  milliseconds: 'Milisaniye',
  timeSelect: 'Demê hilbijêre',
  dateSelect: 'Dîrok hilbijêre',
  monthSelect: 'Meh hilbijêre',
  yearSelect: 'Sal hilbijêre',
  decadeSelect: 'Dehsal hilbijêre',
  hourSelect: 'Saetek hilbijêre',
  minuteSelect: 'Deqîqeyek hilbijêre',
  secondSelect: 'Saniyeyek hilbijêre',
  millisecondSelect: 'Milisaniyeyek hilbijêre',
  meridiemSelect: 'Meridyemê hilbijêre',

  previousMonth: 'Meha peş',
  nextMonth: 'Meha paş',
  previousYear: 'Sala peş',
  nextYear: 'Sala paş',
  previousDecade: 'Dehsalen peş',
  nextDecade: 'Dehsalen paş',
  previousCentury: 'Sedsalen peş',
  nextCentury: 'Sedsalen paş',
};

export default locale;

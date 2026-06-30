import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'ga_IE',
  today: 'inniu',
  now: 'anois',
  backToToday: 'Ar ais inniu',
  ok: 'ceart go leor',
  clear: 'soiléir',
  week: 'seachtain',
  month: 'mhí',
  year: 'bhliain',
  hours: 'Uaireanta',
  minutes: 'Nóiméad',
  seconds: 'Soicindí',
  milliseconds: 'Milleasoicindí',
  timeSelect: 'roghnaigh am',
  dateSelect: 'roghnaigh dáta',
  weekSelect: 'Roghnaigh seachtain',
  monthSelect: 'Roghnaigh mí',
  yearSelect: 'Roghnaigh bliain',
  decadeSelect: 'Roghnaigh deich mbliana',
  hourSelect: 'Roghnaigh uair',
  minuteSelect: 'Roghnaigh nóiméad',
  secondSelect: 'Roghnaigh soicind',
  millisecondSelect: 'Roghnaigh milleasoicind',
  meridiemSelect: 'Roghnaigh meiridhiam',

  previousMonth: 'An mhí roimhe seo (PageUp)',
  nextMonth: 'An mhí seo chugainn (PageDown)',
  previousYear: 'Anuraidh (Control + left)',
  nextYear: 'An bhliain seo chugainn (Control + right)',
  previousDecade: 'Le deich mbliana anuas',
  nextDecade: 'Deich mbliana amach romhainn',
  previousCentury: 'An chéid seo caite',
  nextCentury: 'An chéad aois eile',
};

export default locale;

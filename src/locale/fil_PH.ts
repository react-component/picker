import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'fil_PH',
  today: 'Ngayon',
  now: 'Ngayon',
  backToToday: 'Bumalik sa ngayon',
  ok: 'OK',
  clear: 'Burahin',
  week: 'Linggo',
  month: 'Buwan',
  year: 'Taon',
  timeSelect: 'Pumili ng oras',
  dateSelect: 'Pumili ng petsa',
  weekSelect: 'Pumili ng linggo',
  monthSelect: 'Pumili ng buwan',
  yearSelect: 'Pumili ng taon',
  decadeSelect: 'Pumili ng dekada',

  previousMonth: 'Nakaraang buwan (PageUp)',
  nextMonth: 'Susunod na buwan (PageDown)',
  previousYear: 'Nakaraang taon (Control + Left)',
  nextYear: 'Susunod na taon (Control + Right)',
  previousDecade: 'Nakaraang dekada',
  nextDecade: 'Susunod na dekada',
  previousCentury: 'Nakaraang siglo',
  nextCentury: 'Susunod na siglo',
};

export default locale;

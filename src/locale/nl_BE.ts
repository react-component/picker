import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'nl_BE',
  today: 'Vandaag',
  now: 'Nu',
  backToToday: 'Terug naar vandaag',
  ok: 'OK',
  clear: 'Reset',
  week: 'Week',
  month: 'Maand',
  year: 'Jaar',
  timeSelect: 'Selecteer tijd',
  dateSelect: 'Selecteer datum',
  monthSelect: 'Kies een maand',
  yearSelect: 'Kies een jaar',
  decadeSelect: 'Kies een decennium',

  previousMonth: 'Vorige maand',
  nextMonth: 'Volgende maand',
  previousYear: 'Vorig jaar',
  nextYear: 'Volgend jaar',
  previousDecade: 'Vorig decennium',
  nextDecade: 'Volgend decennium',
  previousCentury: 'Vorige eeuw',
  nextCentury: 'Volgende eeuw',
};

export default locale;

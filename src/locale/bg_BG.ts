import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'bg_BG',
  today: 'Днес',
  now: 'Сега',
  backToToday: 'Към днес',
  ok: 'Добре',
  clear: 'Изчистване',
  week: 'Седмица',
  month: 'Месец',
  year: 'Година',
  timeSelect: 'Избор на час',
  dateSelect: 'Избор на дата',
  monthSelect: 'Избор на месец',
  yearSelect: 'Избор на година',
  decadeSelect: 'Десетилетие',
  previousMonth: 'Предишен месец',
  nextMonth: 'Следващ месец',
  previousYear: 'Последна година',
  nextYear: 'Следваща година',
  previousDecade: 'Предишно десетилетие',
  nextDecade: 'Следващо десетилетие',
  previousCentury: 'Последен век',
  nextCentury: 'Следващ век',
};
export default locale;

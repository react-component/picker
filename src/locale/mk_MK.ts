import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'mk_MK',
  today: 'Денес',
  now: 'Сега',
  backToToday: 'Назад до денес',
  ok: 'ОК',
  clear: 'Избриши',
  week: 'Недела',
  month: 'Месец',
  year: 'Година',
  timeSelect: 'Избери време',
  dateSelect: 'Избери датум',
  monthSelect: 'Избери месец',
  yearSelect: 'Избери година',
  decadeSelect: 'Избери деценија',

  previousMonth: 'Претходен месец (PageUp)',
  nextMonth: 'Нареден месец (PageDown)',
  previousYear: 'Претходна година (Control + left)',
  nextYear: 'Наредна година (Control + right)',
  previousDecade: 'Претходна деценија',
  nextDecade: 'Наредна деценија',
  previousCentury: 'Претходен век',
  nextCentury: 'Нареден век',
};

export default locale;

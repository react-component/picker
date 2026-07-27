import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'sr_Cyrl_RS',
  today: 'Данас',
  now: 'Сада',
  backToToday: 'Врати се на данас',
  ok: 'У реду',
  clear: 'Обриши',
  week: 'Недеља',
  month: 'Месец',
  year: 'Година',
  timeSelect: 'Изабери време',
  dateSelect: 'Изабери датум',
  monthSelect: 'Изабери месец',
  yearSelect: 'Изабери годину',
  decadeSelect: 'Изабери деценију',

  previousMonth: 'Претходни месец',
  nextMonth: 'Следећи месец',
  previousYear: 'Претходна година',
  nextYear: 'Следећа година',
  previousDecade: 'Претходна деценија',
  nextDecade: 'Следећа деценија',
  previousCentury: 'Претходни век',
  nextCentury: 'Следећи век',
};

export default locale;

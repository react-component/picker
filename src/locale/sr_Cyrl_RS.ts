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
  hours: 'Сати',
  minutes: 'Минути',
  seconds: 'Секунде',
  milliseconds: 'Милисекунде',
  timeSelect: 'Изабери време',
  dateSelect: 'Изабери датум',
  monthSelect: 'Изабери месец',
  yearSelect: 'Изабери годину',
  decadeSelect: 'Изабери деценију',
  hourSelect: 'Изаберите сат',
  minuteSelect: 'Изаберите минут',
  secondSelect: 'Изаберите секунду',
  millisecondSelect: 'Изаберите милисекунду',
  meridiemSelect: 'Изаберите меридијем',

  previousMonth: 'Претходни месец (PageUp)',
  nextMonth: 'Следећи месец (PageDown)',
  previousYear: 'Претходна година (Control + left)',
  nextYear: 'Следећа година (Control + right)',
  previousDecade: 'Претходна деценија',
  nextDecade: 'Следећа деценија',
  previousCentury: 'Претходни век',
  nextCentury: 'Следећи век',
};

export default locale;

import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'sr_RS',
  today: 'Danas',
  now: 'Sada',
  backToToday: 'Vrati se na danas',
  ok: 'U redu',
  clear: 'Obriši',
  week: 'Nedelja',
  month: 'Mesec',
  year: 'Godina',
  timeSelect: 'Izaberi vreme',
  dateSelect: 'Izaberi datum',
  monthSelect: 'Izaberi mesec',
  yearSelect: 'Izaberi godinu',
  decadeSelect: 'Izaberi deceniju',

  previousMonth: 'Prethodni mesec',
  nextMonth: 'Sledeći mesec',
  previousYear: 'Prethodna godina',
  nextYear: 'Sledeća godina',
  previousDecade: 'Prethodna decenija',
  nextDecade: 'Sledeća decenija',
  previousCentury: 'Prethodni vek',
  nextCentury: 'Sledeći vek',
};

export default locale;

import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'fi_FI',
  today: 'Tänään',
  now: 'Nyt',
  backToToday: 'Tämä päivä',
  ok: 'OK',
  clear: 'Tyhjennä',
  week: 'Viikko',
  month: 'Kuukausi',
  year: 'Vuosi',
  timeSelect: 'Valise aika',
  dateSelect: 'Valitse päivä',
  monthSelect: 'Valitse kuukausi',
  yearSelect: 'Valitse vuosi',
  decadeSelect: 'Valitse vuosikymmen',

  previousMonth: 'Edellinen kuukausi',
  nextMonth: 'Seuraava kuukausi',
  previousYear: 'Edellinen vuosi',
  nextYear: 'Seuraava vuosi',
  previousDecade: 'Edellinen vuosikymmen',
  nextDecade: 'Seuraava vuosikymmen',
  previousCentury: 'Edellinen vuosisata',
  nextCentury: 'Seuraava vuosisata',
};

export default locale;

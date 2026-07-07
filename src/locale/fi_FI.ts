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
  hours: 'Tunnit',
  minutes: 'Minuutit',
  seconds: 'Sekunnit',
  milliseconds: 'Millisekunnit',
  timeSelect: 'Valise aika',
  dateSelect: 'Valitse päivä',
  monthSelect: 'Valitse kuukausi',
  yearSelect: 'Valitse vuosi',
  decadeSelect: 'Valitse vuosikymmen',
  hourSelect: 'Valitse tunti',
  minuteSelect: 'Valitse minuutti',
  secondSelect: 'Valitse sekunti',
  millisecondSelect: 'Valitse millisekunti',
  meridiemSelect: 'Valitse meridieemi',

  previousMonth: 'Edellinen kuukausi (PageUp)',
  nextMonth: 'Seuraava kuukausi (PageDown)',
  previousYear: 'Edellinen vuosi (Control + left)',
  nextYear: 'Seuraava vuosi (Control + right)',
  previousDecade: 'Edellinen vuosikymmen',
  nextDecade: 'Seuraava vuosikymmen',
  previousCentury: 'Edellinen vuosisata',
  nextCentury: 'Seuraava vuosisata',
};

export default locale;

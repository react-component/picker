import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'fr_BE',
  today: "Aujourd'hui",
  now: 'Maintenant',
  backToToday: "Aujourd'hui",
  ok: 'OK',
  clear: 'Rétablir',
  week: 'Semaine',
  month: 'Mois',
  year: 'Année',
  timeSelect: "Sélectionner l'heure",
  dateSelect: "Sélectionner l'heure",
  monthSelect: 'Choisissez un mois',
  yearSelect: 'Choisissez une année',
  decadeSelect: 'Choisissez une décennie',

  previousMonth: 'Mois précédent',
  nextMonth: 'Mois suivant',
  previousYear: 'Année précédente',
  nextYear: 'Année prochaine',
  previousDecade: 'Décennie précédente',
  nextDecade: 'Décennie suivante',
  previousCentury: 'Siècle précédent',
  nextCentury: 'Siècle suivant',
};

export default locale;

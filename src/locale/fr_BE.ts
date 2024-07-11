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
  month: 'Mois',
  year: 'Année',
  timeSelect: "Sélectionner l'heure",
  dateSelect: "Sélectionner l'heure",
  monthSelect: 'Choisissez un mois',
  yearSelect: 'Choisissez une année',
  decadeSelect: 'Choisissez une décennie',

  dateFormat: 'D/M/YYYY',

  dateTimeFormat: 'D/M/YYYY HH:mm:ss',

  previousMonth: 'Mois précédent (PageUp)',
  nextMonth: 'Mois suivant (PageDown)',
  previousYear: 'Année précédente (Ctrl + gauche)',
  nextYear: 'Année prochaine (Ctrl + droite)',
  previousDecade: 'Décennie précédente',
  nextDecade: 'Décennie suivante',
  previousCentury: 'Siècle précédent',
  nextCentury: 'Siècle suivant',
};

export default locale;

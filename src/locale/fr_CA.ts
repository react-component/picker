import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'fr_CA',
  today: "Aujourd'hui",
  now: 'Maintenant',
  backToToday: "Aujourd'hui",
  ok: 'OK',
  clear: 'Rétablir',
  week: 'Semaine',
  month: 'Mois',
  year: 'Année',
  timeSelect: "Sélectionner l'heure",
  dateSelect: 'Sélectionner la date',
  monthSelect: 'Choisissez un mois',
  yearSelect: 'Choisissez une année',
  decadeSelect: 'Choisissez une décennie',

  dayFormat: 'DD',

  previousMonth: 'Mois précédent',
  nextMonth: 'Mois suivant',
  previousYear: 'Année précédente',
  nextYear: 'Année prochaine',
  previousDecade: 'Décennie précédente',
  nextDecade: 'Décennie suivante',
  previousCentury: 'Siècle précédent',
  nextCentury: 'Siècle suivant',
  calendarFallback: {
    months: [
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre',
    ],
    shortMonths: [
      'janv.',
      'févr.',
      'mars',
      'avr.',
      'mai',
      'juin',
      'juil.',
      'août',
      'sept.',
      'oct.',
      'nov.',
      'déc.',
    ],
    shortWeekDays: ['di', 'lu', 'ma', 'me', 'je', 've', 'sa'],
  },
};

export default locale;

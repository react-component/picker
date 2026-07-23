import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'si_LK',
  today: 'අද',
  now: 'දැන්',
  backToToday: 'අදට ආපසු',
  ok: 'හරි',
  clear: 'හිස් කරන්න',
  week: 'සතිය',
  month: 'මාසය',
  year: 'අවුරුද්ද',
  timeSelect: 'වේලාවක් තෝරන්න',
  dateSelect: 'දිනයක් තෝරන්න',
  weekSelect: 'සතියක් තෝරන්න',
  monthSelect: 'මාසයක් තෝරන්න',
  yearSelect: 'අවුරුද්දක් තෝරන්න',
  decadeSelect: 'දශකයක් තෝරන්න',

  monthBeforeYear: false,
  previousMonth: 'කලින් මාසය',
  nextMonth: 'ඊළඟ මාසය',
  previousYear: 'පසුගිය අවුරුද්ද',
  nextYear: 'ඊළඟ අවුරුද්ද',
  previousDecade: 'පසුගිය දශකය',
  nextDecade: 'ඊළඟ දශකය',
  previousCentury: 'පසුගිය සියවස',
  nextCentury: 'ඊළඟ සියවස',
};

export default locale;

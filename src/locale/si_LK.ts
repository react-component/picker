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
  hours: 'පැය',
  minutes: 'මිනිත්තු',
  seconds: 'තත්පර',
  milliseconds: 'මිලිතත්පර',
  timeSelect: 'වේලාවක් තෝරන්න',
  dateSelect: 'දිනයක් තෝරන්න',
  weekSelect: 'සතියක් තෝරන්න',
  monthSelect: 'මාසයක් තෝරන්න',
  yearSelect: 'අවුරුද්දක් තෝරන්න',
  decadeSelect: 'දශකයක් තෝරන්න',
  hourSelect: 'පැයක් තෝරන්න',
  minuteSelect: 'මිනිත්තුවක් තෝරන්න',
  secondSelect: 'තත්පරයක් තෝරන්න',
  millisecondSelect: 'මිලිතත්පරයක් තෝරන්න',
  meridiemSelect: 'මෙරිඩියම් තෝරන්න',

  monthBeforeYear: false,
  previousMonth: 'කලින් මාසය (පිටුව ඉහළට)',
  nextMonth: 'ඊළඟ මාසය (පිටුව පහළට)',
  previousYear: 'පසුගිය අවුරුද්ද (Control + වම)',
  nextYear: 'ඊළඟ අවුරුද්ද (Control + දකුණ)',
  previousDecade: 'පසුගිය දශකය',
  nextDecade: 'ඊළඟ දශකය',
  previousCentury: 'පසුගිය සියවස',
  nextCentury: 'ඊළඟ සියවස',
};

export default locale;

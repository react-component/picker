import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'uz_Cyrl_UZ',
  today: 'Бугун',
  now: 'Ҳозир',
  backToToday: 'Бугунга қайтиш',
  ok: 'ОК',
  clear: 'Тозалаш',
  week: 'Ҳафта',
  month: 'Ой',
  year: 'Йил',
  timeSelect: 'Вақтни танланг',
  dateSelect: 'Санани танланг',
  weekSelect: 'Ҳафтани танланг',
  monthSelect: 'Ойни танланг',
  yearSelect: 'Йилни танланг',
  decadeSelect: 'Ўн йилликни танланг',

  previousMonth: 'Олдинги ой',
  nextMonth: 'Кейинги ой',
  previousYear: 'Олдинги йил',
  nextYear: 'Кейинги йил',
  previousDecade: 'Олдинги ўн йиллик',
  nextDecade: 'Кейинги ўн йиллик',
  previousCentury: 'Олдинги аср',
  nextCentury: 'Кейинги аср',
};

export default locale;

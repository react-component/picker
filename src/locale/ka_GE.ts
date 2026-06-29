import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'ka_GE',
  today: 'დღეს',
  now: 'ახლა',
  backToToday: 'მიმდინარე თარიღი',
  ok: 'OK',
  clear: 'გასუფთავება',
  week: 'კვირა',
  month: 'თვე',
  year: 'წელი',
  hours: 'საათები',
  minutes: 'წუთები',
  seconds: 'წამები',
  milliseconds: 'მილიწამები',
  timeSelect: 'დროის არჩევა',
  dateSelect: 'თარიღის არჩევა',
  weekSelect: 'კვირის არჩევა',
  monthSelect: 'თვის არჩევა',
  yearSelect: 'წლის არჩევა',
  decadeSelect: 'ათწლეულის არჩევა',
  hourSelect: 'საათის არჩევა',
  minuteSelect: 'წუთის არჩევა',
  secondSelect: 'წამის არჩევა',
  millisecondSelect: 'მილიწამის არჩევა',
  meridiemSelect: 'მერიდიანის არჩევა',

  previousMonth: 'წინა თვე (PageUp)',
  nextMonth: 'მომდევნო თვე (PageDown)',
  previousYear: 'წინა წელი (Control + left)',
  nextYear: 'მომდევნო წელი (Control + right)',
  previousDecade: 'წინა ათწლეული',
  nextDecade: 'მომდევნო ათწლეული',
  previousCentury: 'გასული საუკუნე',
  nextCentury: 'მომდევნო საუკუნე',
};

export default locale;

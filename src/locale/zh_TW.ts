import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'zh_TW',

  today: '今天',
  now: '此刻',
  backToToday: '返回今天',
  ok: '確定',
  timeSelect: '選擇時間',
  dateSelect: '選擇日期',
  weekSelect: '選擇周',
  clear: '清除',
  week: '週',
  month: '月',
  year: '年',
  hours: '時',
  minutes: '分',
  seconds: '秒',
  milliseconds: '毫秒',
  previousMonth: '上個月',
  nextMonth: '下個月',
  monthSelect: '選擇月份',
  yearSelect: '選擇年份',
  decadeSelect: '選擇年代',
  hourSelect: '選擇時',
  minuteSelect: '選擇分',
  secondSelect: '選擇秒',
  millisecondSelect: '選擇毫秒',
  meridiemSelect: '選擇上午/下午',

  yearFormat: 'YYYY年',

  previousYear: '上一年',
  nextYear: '下一年',
  previousDecade: '上一年代',
  nextDecade: '下一年代',
  previousCentury: '上一世紀',
  nextCentury: '下一世紀',

  cellDateFormat: 'D',
  monthBeforeYear: false,
};

export default locale;

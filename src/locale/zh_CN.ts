import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'zh_CN',
  today: '今天',
  now: '此刻',
  backToToday: '返回今天',
  ok: '确定',
  timeSelect: '选择时间',
  dateSelect: '选择日期',
  weekSelect: '选择周',
  clear: '清除',
  week: '周',
  month: '月',
  year: '年',
  hours: '时',
  minutes: '分',
  seconds: '秒',
  milliseconds: '毫秒',
  previousMonth: '上个月',
  nextMonth: '下个月',
  monthSelect: '选择月份',
  yearSelect: '选择年份',
  decadeSelect: '选择年代',
  hourSelect: '选择时',
  minuteSelect: '选择分',
  secondSelect: '选择秒',
  millisecondSelect: '选择毫秒',
  meridiemSelect: '选择上午/下午',

  previousYear: '上一年',
  nextYear: '下一年',
  previousDecade: '上一年代',
  nextDecade: '下一年代',
  previousCentury: '上一世纪',
  nextCentury: '下一世纪',

  yearFormat: 'YYYY年',
  cellDateFormat: 'D',
  monthBeforeYear: false,
};

export default locale;

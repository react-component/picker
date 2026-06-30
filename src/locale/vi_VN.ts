import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'vi_VN',
  today: 'Hôm nay',
  now: 'Bây giờ',
  backToToday: 'Trở về hôm nay',
  ok: 'OK',
  clear: 'Xóa',
  week: 'Tuần',
  month: 'Tháng',
  year: 'Năm',
  timeSelect: 'Chọn thời gian',
  dateSelect: 'Chọn ngày',
  weekSelect: 'Chọn tuần',
  monthSelect: 'Chọn tháng',
  yearSelect: 'Chọn năm',
  decadeSelect: 'Chọn thập kỷ',

  previousMonth: 'Tháng trước',
  nextMonth: 'Tháng sau',
  previousYear: 'Năm trước',
  nextYear: 'Năm sau',
  previousDecade: 'Thập kỷ trước',
  nextDecade: 'Thập kỷ sau',
  previousCentury: 'Thế kỷ trước',
  nextCentury: 'Thế kỷ sau',
};

export default locale;

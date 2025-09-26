import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'mr_IN',
  today: 'आज',
  now: 'आता',
  backToToday: 'आजवर परत जा',
  ok: 'ठीक आहे',
  clear: 'साफ करा',
  week: 'आठवडा',
  month: 'महिना',
  year: 'वर्ष',
  timeSelect: 'वेळ निवडा',
  dateSelect: 'दिनांक निवडा',
  weekSelect: 'आठवडा निवडा',
  monthSelect: 'महिना निवडा',
  yearSelect: 'वर्ष निवडा',
  decadeSelect: 'दशक निवडा',

  previousMonth: 'मागील महिना (पेजअप)',
  nextMonth: 'पुढचा महिना (पेजडाउन)',
  previousYear: 'गेल्या वर्षी (Ctrl + left)',
  nextYear: 'पुढचे वर्ष (Ctrl + right)',
  previousDecade: 'मागील दशक',
  nextDecade: 'पुढचे दशक',
  previousCentury: 'मागील शतक',
  nextCentury: 'पुढचे शतक',
};

export default locale;

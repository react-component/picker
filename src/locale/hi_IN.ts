import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'hi_IN',
  today: 'आज',
  now: 'अभी',
  backToToday: 'आज तक',
  ok: 'ठीक',
  clear: 'स्पष्ट',
  month: 'महीना',
  year: 'साल',
  timeSelect: 'समय का चयन करें',
  dateSelect: 'तारीख़ चुनें',
  weekSelect: 'एक सप्ताह चुनें',
  monthSelect: 'एक महीना चुनें',
  yearSelect: 'एक वर्ष चुनें',
  decadeSelect: 'एक दशक चुनें',

  dateFormat: 'M/D/YYYY',

  dateTimeFormat: 'M/D/YYYY HH:mm:ss',

  previousMonth: 'पिछला महीना (पेजअप)',
  nextMonth: 'अगले महीने (पेजडाउन)',
  previousYear: 'पिछले साल (Ctrl + बाएं)',
  nextYear: 'अगले साल (Ctrl + दाहिना)',
  previousDecade: 'पिछला दशक',
  nextDecade: 'अगले दशक',
  previousCentury: 'पीछ्ली शताब्दी',
  nextCentury: 'अगली सदी',
};

export default locale;

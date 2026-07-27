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
  week: 'सप्ताह',
  month: 'महीना',
  year: 'साल',
  timeSelect: 'समय का चयन करें',
  dateSelect: 'तारीख़ चुनें',
  weekSelect: 'एक सप्ताह चुनें',
  monthSelect: 'एक महीना चुनें',
  yearSelect: 'एक वर्ष चुनें',
  decadeSelect: 'एक दशक चुनें',

  previousMonth: 'पिछला महीना',
  nextMonth: 'अगले महीने',
  previousYear: 'पिछले साल',
  nextYear: 'अगले साल',
  previousDecade: 'पिछला दशक',
  nextDecade: 'अगले दशक',
  previousCentury: 'पीछ्ली शताब्दी',
  nextCentury: 'अगली सदी',
};

export default locale;

import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'kn_IN',
  today: 'ಇಂದು',
  now: 'ಈಗ',
  backToToday: 'ಇಂದು ಹಿಂದಿರುಗಿ',
  ok: 'ಸರಿ',
  clear: 'ಸ್ಪಷ್ಟ',
  week: 'ವಾರ',
  month: 'ತಿಂಗಳು',
  year: 'ವರ್ಷ',
  hours: 'ಗಂಟೆಗಳು',
  minutes: 'ನಿಮಿಷಗಳು',
  seconds: 'ಸೆಕೆಂಡುಗಳು',
  milliseconds: 'ಮಿಲಿಸೆಕೆಂಡುಗಳು',
  timeSelect: 'ಸಮಯ ಆಯ್ಕೆಮಾಡಿ',
  dateSelect: 'ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ',
  weekSelect: 'ಒಂದು ವಾರದ ಆರಿಸಿ',
  monthSelect: 'ಒಂದು ತಿಂಗಳು ಆಯ್ಕೆಮಾಡಿ',
  yearSelect: 'ಒಂದು ವರ್ಷ ಆರಿಸಿ',
  decadeSelect: 'ಒಂದು ದಶಕದ ಆಯ್ಕೆಮಾಡಿ',
  hourSelect: 'ಒಂದು ಗಂಟೆ ಆಯ್ಕೆಮಾಡಿ',
  minuteSelect: 'ಒಂದು ನಿಮಿಷ ಆಯ್ಕೆಮಾಡಿ',
  secondSelect: 'ಒಂದು ಸೆಕೆಂಡ್ ಆಯ್ಕೆಮಾಡಿ',
  millisecondSelect: 'ಒಂದು ಮಿಲಿಸೆಕೆಂಡ್ ಆಯ್ಕೆಮಾಡಿ',
  meridiemSelect: 'ಮೆರಿಡಿಯಮ್ ಆಯ್ಕೆಮಾಡಿ',

  previousMonth: 'ಹಿಂದಿನ ತಿಂಗಳು (ಪೇಜ್ಅಪ್)',
  nextMonth: 'ಮುಂದಿನ ತಿಂಗಳು (ಪೇಜ್ಡೌನ್)',
  previousYear: 'ಕಳೆದ ವರ್ಷ (Ctrl + ಎಡ)',
  nextYear: 'ಮುಂದಿನ ವರ್ಷ (Ctrl + ಬಲ)',
  previousDecade: 'ಕಳೆದ ದಶಕ',
  nextDecade: 'ಮುಂದಿನ ದಶಕ',
  previousCentury: 'ಕಳೆದ ಶತಮಾನ',
  nextCentury: 'ಮುಂದಿನ ಶತಮಾನ',
};

export default locale;

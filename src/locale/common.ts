import type { Locale } from '../interface';

export const commonLocale: Partial<Locale> = {
  yearFormat: 'YYYY',
  dayFormat: 'D',
  cellMeridiemFormat: 'A',
  monthBeforeYear: true,

  // Default values for optional keys
  hourSelect: 'Select an hour',
  minuteSelect: 'Select a minute',
  secondSelect: 'Select a second',
  millisecondSelect: 'Select a millisecond',
  meridiemSelect: 'Select a meridiem',
};

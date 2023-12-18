import React from 'react';
import type { Locale } from '../../interface';

/**
 * Used for `useFilledProps` since it already in the React.useMemo
 */
export function fillLocale(locale: Locale) {
  // Not fill `monthFormat` since `locale.shortMonths` handle this
  // Not fill `cellMeridiemFormat` since AM & PM by default
  const {
    // Input Field
    fieldDateTimeFormat,
    fieldDateFormat,
    fieldTimeFormat,
    fieldMonthFormat,
    fieldYearFormat,
    fieldWeekFormat,
    fieldQuarterFormat,

    // Header Format
    yearFormat,
    // monthFormat,

    // Cell format
    cellYearFormat,
    cellQuarterFormat,
    dayFormat,
    cellDateFormat,

    // cellMeridiemFormat,
  } = locale;

  return {
    ...locale,

    fieldDateTimeFormat: fieldDateTimeFormat || 'YYYY-MM-DD HH:mm:ss',
    fieldDateFormat: fieldDateFormat || 'YYYY-MM-DD',
    fieldTimeFormat: fieldTimeFormat || 'HH:mm:ss',
    fieldMonthFormat: fieldMonthFormat || 'YYYY-MM',
    fieldYearFormat: fieldYearFormat || 'YYYY',
    fieldWeekFormat: fieldWeekFormat || 'gggg-wo',
    fieldQuarterFormat: fieldQuarterFormat || 'YYYY-[Q]Q',

    yearFormat: yearFormat || 'YYYY',

    cellYearFormat: cellYearFormat || 'YYYY',
    cellQuarterFormat: cellQuarterFormat || '[Q]Q',
    cellDateFormat: cellDateFormat || dayFormat || 'D',
  };
}

/**
 * Fill locale format as start up
 */
export default function useLocale(locale: Locale) {
  return React.useMemo(() => fillLocale(locale), [locale]);
}

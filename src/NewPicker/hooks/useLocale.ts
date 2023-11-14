import React from 'react';
import type { Locale } from '../interface';

/**
 * Fill locale format as start up
 */
export default function useLocale(locale: Locale) {
  return React.useMemo(() => {
    // Not fill `monthFormat` since `locale.shortMonths` handle this
    // Not fill `meridiemCellFormat` since AM & PM by default
    const {
      // Input Field
      dateFormat,
      dateTimeFormat,
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
      yearCellFormat,
      quarterCellFormat,
      dayFormat,
      dateCellFormat,

      // meridiemCellFormat,
    } = locale;

    return {
      ...locale,

      fieldDateTimeFormat: fieldDateTimeFormat || dateTimeFormat || 'YYYY-MM-DD HH:mm:ss',
      fieldDateFormat: fieldDateFormat || dateFormat || 'YYYY-MM-DD',
      fieldTimeFormat: fieldTimeFormat || 'HH:mm:ss',
      fieldMonthFormat: fieldMonthFormat || 'YYYY-MM',
      fieldYearFormat: fieldYearFormat || 'YYYY',
      fieldWeekFormat: fieldWeekFormat || 'gggg-wo',
      fieldQuarterFormat: fieldQuarterFormat || 'YYYY-[Q]Q',

      yearFormat: yearFormat || 'YYYY',

      yearCellFormat: yearCellFormat || 'YYYY',
      quarterCellFormat: quarterCellFormat || '[Q]Q',
      dateCellFormat: dateCellFormat || dayFormat || 'D',
    };
  }, [locale]);
}

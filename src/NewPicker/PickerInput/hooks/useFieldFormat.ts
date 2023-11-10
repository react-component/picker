import * as React from 'react';
import type { FormatType, InternalMode, Locale, SharedPickerProps } from '../../interface';
import { toArray } from '../../util';

function getRowFormat(picker: InternalMode, locale: Locale, format?: SharedPickerProps['format']) {
  if (format) {
    return format;
  }

  switch (picker) {
    // All from the `locale.fieldXXXFormat` first
    case 'time':
      return locale.fieldTimeFormat || 'HH:mm:ss';
    case 'datetime':
      return locale.fieldDateTimeFormat || 'YYYY-MM-DD HH:mm:ss';
    case 'month':
      return locale.fieldMonthFormat || 'YYYY-MM';
    case 'year':
      return locale.fieldYearFormat || 'YYYY';
    case 'quarter':
      return locale.fieldQuarterFormat || 'YYYY-[Q]Q';
    case 'week':
      return locale.fieldWeekFormat || 'gggg-wo';

    default:
      return locale.fieldDateFormat || 'YYYY-MM-DD';
  }
}

export function useFieldFormat<DateType = any>(
  picker: InternalMode,
  locale: Locale,
  format?: SharedPickerProps['format'],
): [formatList: FormatType<DateType>[], maskFormat?: string] {
  return React.useMemo(() => {
    const rawFormat = getRowFormat(picker, locale, format);

    const formatList = toArray(rawFormat);

    const firstFormat = formatList[0];
    const maskFormat =
      typeof firstFormat === 'object' && firstFormat.align ? firstFormat.format : null;

    return [
      // Format list
      formatList.map((config) =>
        typeof config === 'string' || typeof config === 'function' ? config : config.format,
      ),
      // Mask Format
      maskFormat,
    ];
  }, [picker, locale, format]);
}

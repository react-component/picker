import * as React from 'react';
import type { InternalMode, Locale, SharedPickerProps } from '../../interface';

function getRowFormat(picker: InternalMode, locale: Locale, format?: SharedPickerProps['format']) {
  if (format) {
    return format;
  }

  switch (picker) {
    case 'year':
      return locale.yearFormat || 'YYYY';
    case 'month':
      return locale.monthFormat || 'YYYY-MM';
    case 'datetime':
      return locale.dateTimeFormat || 'YYYY-MM-DD HH:mm:ss';
    default:
      return locale.dateFormat || 'YYYY-MM-DD';

    // TODO: fill rest format
  }
}

export function useFieldFormat(
  picker: InternalMode,
  locale: Locale,
  format?: SharedPickerProps['format'],
): [formatList: string[], maskFormat?: string] {
  return React.useMemo(() => {
    const rawFormat = getRowFormat(picker, locale, format);

    const formatList = Array.isArray(rawFormat) ? rawFormat : [rawFormat];

    const firstFormat = formatList[0];
    const maskFormat =
      typeof firstFormat === 'object' && firstFormat.align ? firstFormat.format : null;

    return [
      // Format list
      formatList.map((config) => (typeof config === 'string' ? config : config.format)),
      // Mask Format
      maskFormat,
    ];
  }, [picker, locale, format]);
}

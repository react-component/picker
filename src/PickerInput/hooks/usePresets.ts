import * as React from 'react';
import warning from 'rc-util/lib/warning';
import type { ValueDate } from '../../interface';

export default function usePresets<DateType = any>(
  presets?: ValueDate<DateType>[],
  legacyRanges?: Record<string, DateType | (() => DateType)>,
): ValueDate<DateType>[] {
  return React.useMemo(() => {
    if (presets) {
      return presets;
    }

    if (legacyRanges) {
      warning(false, '`ranges` is deprecated. Please use `presets` instead.');

      return Object.entries(legacyRanges).map(([label, value]) => ({
        label,
        value,
      }));
    }

    return [];
  }, [presets, legacyRanges]);
}

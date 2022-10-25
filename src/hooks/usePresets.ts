import * as React from 'react';
import warning from 'rc-util/lib/warning';
import type { PresetDate } from '../interface';

export default function usePresets<T>(
  presets?: PresetDate<T>[],
  legacyRanges?: Record<string, T | (() => T)>,
): PresetDate<T>[] {
  return React.useMemo(() => {
    if (presets) {
      return presets;
    }

    if (legacyRanges) {
      warning(false, '`ranges` is deprecated. Please use `presets` instead.');

      const rangeLabels = Object.keys(legacyRanges);

      return rangeLabels.map((label) => {
        const range = legacyRanges[label];
        const newValues = typeof range === 'function' ? (range as any)() : range;

        return {
          label,
          value: newValues,
        };
      });
    }

    return [];
  }, [presets, legacyRanges]);
}

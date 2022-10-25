import type { PresetDate } from '../interface';
import * as React from 'react';

export default function usePresets<T>(
  presets?: PresetDate<T>[],
  legacyRanges?: Record<string, T | (() => T)>,
): PresetDate<T>[] {
  return React.useMemo(() => {
    if (presets) {
      return presets;
    }

    if (legacyRanges) {
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

import { useMemo } from 'react';
import type { SharedPickerProps } from '../interface';

export type FilledClassNames = NonNullable<SharedPickerProps['classNames']> & {
  popup: NonNullable<SharedPickerProps['classNames']>['popup'];
};

export type FilledStyles = NonNullable<SharedPickerProps['styles']> & {
  popup: NonNullable<SharedPickerProps['styles']>['popup'];
};

/**
 * Convert `classNames` & `styles` to a fully filled object
 */
export default function useSemantic(
  classNames?: SharedPickerProps['classNames'],
  styles?: SharedPickerProps['styles'],
) {
  return useMemo(() => {
    const mergedClassNames: FilledClassNames = {
      ...classNames,
      popup: classNames?.popup || {},
    };

    const mergedStyles: FilledStyles = {
      ...styles,
      popup: styles?.popup || {},
    };

    return [mergedClassNames, mergedStyles] as const;
  }, [classNames, styles]);
}

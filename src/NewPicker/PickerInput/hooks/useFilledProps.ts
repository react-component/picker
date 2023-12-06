import * as React from 'react';
import useLocale from '../../hooks/useLocale';
import type { Locale, PickerMode } from '../../interface';

export default function useFilledProps<T extends { locale: Locale; picker?: PickerMode }>(
  props: T,
  additionalProps?: Partial<T>,
): T {
  const { locale, picker = 'date' } = props;

  const filledLocale = useLocale(locale);

  return React.useMemo(
    () => ({
      ...props,
      locale: filledLocale,
      picker,
      ...additionalProps,
    }),
    [props],
  );
}

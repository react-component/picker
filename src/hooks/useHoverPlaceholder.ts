import { useState } from 'react';
import useValueTexts, { ValueTextConfig } from './useValueTexts';

export default function useHoverPlaceholder<DateType>(
  placeholder: string,
  text: string,
  { formatList, generateConfig, locale }: ValueTextConfig<DateType>,
): [string, (date: DateType) => void, (date: DateType) => void, boolean] {
  const [value, setValue] = useState(null);

  const [valueTexts] = useValueTexts(value, {
    formatList,
    generateConfig,
    locale,
  });

  function onEnter(date: DateType) {
    setValue(date);
  }

  function onLeave() {
    setValue(null);
  }

  const hoverPlaceholder = valueTexts && valueTexts[0];

  return [hoverPlaceholder || placeholder, onEnter, onLeave, !!hoverPlaceholder];
}

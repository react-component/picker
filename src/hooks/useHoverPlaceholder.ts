import { useState } from 'react';
import useValueTexts, { ValueTextConfig } from './useValueTexts';

export default function useHoverPlaceholder<DateType>(
  placeholder: string,
  text: string,
  { formatList, generateConfig, locale }: ValueTextConfig<DateType>,
): [string, (date: DateType) => void, (date: DateType) => void] {
  const [value, setValue] = useState(null);

  const [valueTexts] = useValueTexts(value, {
    formatList,
    generateConfig,
    locale,
  });

  function onEnter(date: DateType) {
    if (!text) {
      setValue(date);
    }
  }

  function onLeave() {
    setValue(null);
  }

  return [(valueTexts && valueTexts[0]) || placeholder, onEnter, onLeave];
}

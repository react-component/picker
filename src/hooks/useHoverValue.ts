import { useState, useEffect } from 'react';
import useValueTexts, { ValueTextConfig } from './useValueTexts';

export default function useHoverValue<DateType>(
  valueText: string,
  { formatList, generateConfig, locale }: ValueTextConfig<DateType>,
): [string, (date: DateType) => void, (date: DateType) => void] {
  const [value, setValue] = useState(null);

  const [, firstText] = useValueTexts(value, {
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

  useEffect(() => {
    onLeave();
  }, [valueText]);

  return [firstText, onEnter, onLeave];
}

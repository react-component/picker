import { useState, useEffect, useRef } from 'react';
import useValueTexts, { ValueTextConfig } from './useValueTexts';

export default function useHoverValue<DateType>(
  valueText: string,
  { formatList, generateConfig, locale }: ValueTextConfig<DateType>,
): [string, (date: DateType) => void, (date: DateType) => void] {
  const [value, internalSetValue] = useState<DateType>(null);
  const raf = useRef(null);

  function setValue(val: DateType, immediately: boolean = false) {
    cancelAnimationFrame(raf.current);
    if (immediately) {
      internalSetValue(val);
      return;
    }
    raf.current = requestAnimationFrame(() => {
      internalSetValue(val);
    });
  }

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

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return [firstText, onEnter, onLeave];
}

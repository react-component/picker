import { useState, useRef, useEffect } from 'react';
import useValueTexts, { ValueTextConfig } from './useValueTexts';

export default function useHoverPlaceholder<DateType>(
  placeholder: string,
  text: string,
  { formatList, generateConfig, locale }: ValueTextConfig<DateType>,
): [string, (date: DateType) => void, (date: DateType) => void] {
  const [value, setValue] = useState(null);
  const raf = useRef(null);

  const [valueTexts] = useValueTexts(value, {
    formatList,
    generateConfig,
    locale,
  });

  function setPlaceholder(date: DateType) {
    if (text && !value) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      setValue(date);
    });
  }

  function onEnter(date: DateType) {
    setPlaceholder(date);
  }

  function onLeave() {
    setPlaceholder(null);
  }

  useEffect(() => {
    if (text && value) {
      setPlaceholder(null);
    }
    return () => {
      cancelAnimationFrame(raf.current);
    };
  }, [text]);

  return [(valueTexts && valueTexts[0]) || placeholder, onEnter, onLeave];
}

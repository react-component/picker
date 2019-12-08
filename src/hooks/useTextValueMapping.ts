import * as React from 'react';

export default function useTextValueMapping<ValueType>({
  valueTexts,
  onTextChange,
}: {
  /** Must useMemo, to assume that `valueTexts` only match on the first change */
  valueTexts: string[];
  onTextChange: (text: string) => void;
}): [string, (text: string) => void, () => void] {
  const [text, setInnerText] = React.useState('');

  function triggerTextChange(value: string) {
    setInnerText(value);
    onTextChange(value);
  }

  function resetText() {
    setInnerText(valueTexts[0]);
  }

  React.useEffect(() => {
    if (valueTexts.every(valText => valText !== text)) {
      resetText();
    }
  }, [valueTexts.join('||')]);

  return [text, triggerTextChange, resetText];
}

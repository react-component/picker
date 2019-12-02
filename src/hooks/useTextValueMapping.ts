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

  function setText(newText: string) {
    setInnerText(newText);
    onTextChange(newText);
  }

  function resetText() {
    setInnerText(valueTexts[0]);
  }

  React.useEffect(() => {
    if (valueTexts.every(valText => valText !== text)) {
      setInnerText(valueTexts[0]);
    }
  }, [valueTexts.join('||')]);

  return [text, setText, resetText];
}

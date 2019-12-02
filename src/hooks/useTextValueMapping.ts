import * as React from 'react';

export default function useTextValueMapping<ValueType>({
  valueTexts,
  onTextChange,
}: {
  /** Must useMemo, to assume that `valueTexts` only match on the first change */
  valueTexts: string[];
  onTextChange: (text: string) => void;
}): [string, React.ChangeEventHandler<HTMLInputElement>] {
  const [text, setInnerText] = React.useState('');

  function triggerTextChange({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) {
    setInnerText(value);
    onTextChange(value);
  }

  React.useEffect(() => {
    if (valueTexts.every(valText => valText !== text)) {
      setInnerText(valueTexts[0]);
    }
  }, [valueTexts.join('||')]);

  return [text, triggerTextChange];
}

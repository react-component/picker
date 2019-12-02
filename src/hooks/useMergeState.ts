import * as React from 'react';

export default function useMergedState<T>({
  value,
  defaultValue,
  defaultStateValue,
  onChange,
}: {
  value?: T;
  defaultValue?: T;
  defaultStateValue: T;
  onChange?: (value: T, prevValue: T) => void;
}): [T, (value: T) => void] {
  const [innerValue, setInnerValue] = React.useState<T>(() => {
    if (value !== undefined) {
      return value;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    return defaultStateValue;
  });

  const mergedValue = value !== undefined ? value : innerValue;

  function triggerChange(newValue: T) {
    setInnerValue(newValue);

    if (onChange) {
      onChange(newValue, mergedValue);
    }
  }

  return [mergedValue, triggerChange];
}

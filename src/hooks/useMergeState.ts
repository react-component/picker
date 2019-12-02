import * as React from 'react';

export default function useMergedState<T, R = T>({
  value,
  defaultValue,
  defaultStateValue,
  onChange,
  postState,
}: {
  value?: T;
  defaultValue?: T;
  defaultStateValue: T;
  onChange?: (value: T, prevValue: T) => void;
  postState?: (value: T) => T;
}): [R, (value: T) => void] {
  const [innerValue, setInnerValue] = React.useState<T>(() => {
    if (value !== undefined) {
      return value;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    return defaultStateValue;
  });

  let mergedValue = value !== undefined ? value : innerValue;
  if (postState) {
    mergedValue = postState(mergedValue);
  }

  function triggerChange(newValue: T) {
    setInnerValue(newValue);

    if (mergedValue !== newValue && onChange) {
      onChange(newValue, mergedValue);
    }
  }

  return [mergedValue, triggerChange];
}

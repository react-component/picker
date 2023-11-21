import * as React from 'react';

/**
 * Sync value with state.
 * This should only used for internal which not affect outside calculation.
 * Since it's not safe for suspense.
 */
export default function useSyncState<T>(
  defaultValue: T,
): [getter: () => T, setter: (nextValue: T) => void] {
  const valueRef = React.useRef(defaultValue);
  const [, forceUpdate] = React.useState({});

  const getter = () => valueRef.current;

  const setter = (nextValue: T) => {
    valueRef.current = nextValue;
    forceUpdate({});
  };

  return [getter, setter];
}

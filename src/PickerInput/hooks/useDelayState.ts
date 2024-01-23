import { useEvent, useMergedState } from 'rc-util';
import raf from 'rc-util/lib/raf';
import React from 'react';

/**
 * Will be `true` immediately for next effect.
 * But will be `false` for a delay of effect.
 */
export default function useDelayState<T>(
  value: T,
  defaultValue?: T,
  onChange?: (next: T) => void,
): [state: T, setState: (nextState: T, immediately?: boolean) => void] {
  const [state, setState] = useMergedState<T>(defaultValue, {
    value,
  });

  const nextValueRef = React.useRef<T>(value);

  // ============================= Update =============================
  const rafRef = React.useRef<number>();
  const cancelRaf = () => {
    raf.cancel(rafRef.current);
  };

  const doUpdate = useEvent(() => {
    setState(nextValueRef.current);

    if (onChange && state !== nextValueRef.current) {
      onChange(nextValueRef.current);
    }
  });

  const updateValue = useEvent((next: T, immediately?: boolean) => {
    cancelRaf();

    nextValueRef.current = next;

    if (next || immediately) {
      doUpdate();
    } else {
      rafRef.current = raf(doUpdate);
    }
  });

  React.useEffect(() => cancelRaf, []);

  return [state, updateValue];
}

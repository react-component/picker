import { useEvent, useMergedState } from 'rc-util';
import { useLayoutUpdateEffect } from 'rc-util/lib/hooks/useLayoutEffect';
import raf from 'rc-util/lib/raf';
import * as React from 'react';

/**
 * Will be `true` immediately for setState.
 * But will be `false` for a requestAnimationFrame.
 */
export default function useLockState<T>(
  value: T,
  defaultValue?: T,
  onChange?: (next: T) => void,
): [state: T, setState: (nextState: T, immediately?: boolean) => void] {
  const [state, setState] = useMergedState<T>(defaultValue, {
    value,
  });
  const rafRef = React.useRef<number>(null);

  const updateValue = useEvent((next: T, immediately?: boolean) => {
    raf.cancel(rafRef.current);

    const doUpdate = () => {
      setState(next);
      onChange?.(next);
    };

    if (next || immediately) {
      doUpdate();
    } else {
      rafRef.current = raf(doUpdate);
    }
  });

  return [state, updateValue];
}

/**
 * Trigger `callback` immediately when `condition` is `true`.
 * But trigger `callback` in next frame when `condition` is `false`.
 */
export function useLockEffect(condition: boolean, callback: (next: boolean) => void) {
  useLayoutUpdateEffect(() => {
    if (condition) {
      callback(condition);
    } else {
      const id = raf(() => {
        callback(condition);
      });

      return () => {
        raf.cancel(id);
      };
    }
  }, [condition]);
}

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
): [state: T, setState: (nextState: T) => void] {
  const [state, setState] = useMergedState<T>(defaultValue, {
    value,
  });
  const rafRef = React.useRef<number>(null);

  const updateValue = useEvent((next: T) => {
    raf.cancel(rafRef.current);

    if (next) {
      setState(next);
    } else {
      rafRef.current = raf(() => {
        setState(next);
      });
    }
  });

  useLayoutUpdateEffect(() => {
    if (onChange) {
      onChange(state);
    }
  }, [state]);

  return [state, updateValue];
}

export function useLockEffect(value: boolean, onChange: (next: boolean) => void) {
  useLayoutUpdateEffect(() => {
    if (value) {
      onChange(value);
    } else {
      const id = raf(() => {
        onChange(value);
      });

      return () => {
        raf.cancel(id);
      };
    }
  }, [value]);
}

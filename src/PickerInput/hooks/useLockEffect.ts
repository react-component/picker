import { raf, useLayoutUpdateEffect } from '@rc-component/util';
import * as React from 'react';

/**
 * Trigger `callback` immediately when `condition` is `true`.
 * But trigger `callback` in next frame when `condition` is `false`.
 */
export default function useLockEffect(
  condition: boolean,
  callback: (next: boolean) => void,
  delayFrames = 1,
) {
  const callbackRef = React.useRef(callback);
  callbackRef.current = callback;

  useLayoutUpdateEffect(() => {
    if (condition) {
      callbackRef.current(condition);
    } else {
      const id = raf(() => {
        callbackRef.current(condition);
      }, delayFrames);

      return () => {
        raf.cancel(id);
      };
    }
  }, [condition]);
}

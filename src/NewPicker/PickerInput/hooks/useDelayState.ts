import { useEvent, useMergedState } from 'rc-util';
import React from 'react';

// We need wait for outside state updated.
// Which means need 2 effect:
// 1. Outside sync state
// 2. Still may be old state
// 3. Safe to sync state
const DELAY_TIMES = 2;

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

  const [times, setTimes] = React.useState<number | false>(false);
  const nextValueRef = React.useRef<T>(value);

  // ============================= Update =============================
  const doUpdate = useEvent(() => {
    setState(nextValueRef.current);

    if (onChange && state !== nextValueRef.current) {
      onChange(nextValueRef.current);
    }
  });

  const updateValue = useEvent((next: T, immediately?: boolean) => {
    nextValueRef.current = next;

    if (next || immediately) {
      doUpdate();
      setTimes(false);
    } else {
      setTimes(0);
    }
  });

  // ============================= Effect =============================
  React.useEffect(() => {
    if (times === DELAY_TIMES) {
      doUpdate();
    } else if (times !== false && times < DELAY_TIMES) {
      setTimes(times + 1);
    }
  }, [times, doUpdate]);

  return [state, updateValue];
}

const EFFECT_DELAY_TIMES = 1;

export function useDelayEffect(condition: boolean, callback: VoidFunction) {
  const [times, setTimes] = React.useState<number | false>(false);
  const prevConditionRef = React.useRef<boolean>(condition);

  const triggerCallback = useEvent(() => {
    if (prevConditionRef.current !== condition) {
      prevConditionRef.current = condition;
      callback();
    }
  });

  React.useEffect(() => {
    if (condition) {
      triggerCallback();
      setTimes(false);
    } else {
      setTimes(0);
    }
  }, [condition]);

  React.useEffect(() => {
    if (times === EFFECT_DELAY_TIMES) {
      triggerCallback();
    } else if (times !== false && times < EFFECT_DELAY_TIMES) {
      setTimes(times + 1);
    }
  }, [times]);
}

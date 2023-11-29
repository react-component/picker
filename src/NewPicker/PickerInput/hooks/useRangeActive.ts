import * as React from 'react';
import type { RangeValueType } from '../RangePicker';
import useLockEffect from './useLockEffect';

export type OperationType = 'input' | 'panel';

export type NextActive<DateType> = (nextValue: RangeValueType<DateType>) => number | null;

/**
 * When user first focus one input, any submit will trigger focus another one.
 * When second time focus one input, submit will not trigger focus again.
 * When click outside to close the panel, trigger event if it can trigger onChange.
 */
export default function useRangeActive<DateType>(
  open: boolean,
  disabled: [boolean, boolean],
  empty: [boolean, boolean],
): [
  activeIndex: number,
  setActiveIndex: (index: number) => void,
  focused: boolean,
  triggerFocus: (focused: boolean) => void,
  lastOperation: (type?: OperationType) => OperationType,
  nextActiveIndex: NextActive<DateType>,
] {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [focused, setFocused] = React.useState<boolean>(false);

  const activeListRef = React.useRef<number[]>([]);

  const lastOperationRef = React.useRef<OperationType>(null);

  const triggerFocus = (nextFocus: boolean) => {
    setFocused(nextFocus);
  };

  // ============================= Record =============================
  const lastOperation = (type?: OperationType) => {
    if (type) {
      lastOperationRef.current = type;
    }
    return lastOperationRef.current;
  };

  // ============================ Strategy ============================
  // Trigger when input enter or input blur or panel close
  const nextActiveIndex: NextActive<DateType> = (nextValue: RangeValueType<DateType>) => {
    const list = activeListRef.current;
    const filledActiveSet = new Set(list.filter((index) => nextValue[index] || empty[index]));
    const nextIndex = list[list.length - 1] === 0 ? 1 : 0;

    if (filledActiveSet.size >= 2 || disabled[nextIndex]) {
      return null;
    }

    return nextIndex;
  };

  // ============================= Effect =============================
  useLockEffect(focused, () => {
    if (!focused) {
      activeListRef.current = [];
    }
  });

  React.useEffect(() => {
    if (focused) {
      activeListRef.current.push(activeIndex);
    }
  }, [focused, activeIndex]);

  return [activeIndex, setActiveIndex, focused, triggerFocus, lastOperation, nextActiveIndex];
}

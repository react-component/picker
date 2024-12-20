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
  disabled: boolean[],
  empty: boolean[] = [],
  mergedOpen: boolean = false,
): [
  focused: boolean,
  triggerFocus: (focused: boolean) => void,
  lastOperation: (type?: OperationType) => OperationType,
  activeIndex: number,
  setActiveIndex: (index: number) => void,
  nextActiveIndex: NextActive<DateType>,
  activeList: number[],
  updateSubmitIndex: (index: number | null) => void,
  hasActiveSubmitValue: (index: number) => boolean,
] {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [focused, setFocused] = React.useState<boolean>(false);

  const activeListRef = React.useRef<number[]>([]);
  const submitIndexRef = React.useRef<number | null>(null);
  const lastOperationRef = React.useRef<OperationType>(null);

  const updateSubmitIndex = (index: number | null) => {
    submitIndexRef.current = index;
  };

  const hasActiveSubmitValue = (index: number) => {
    return submitIndexRef.current === index;
  };

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
  // Wait in case it's from the click outside to blur
  useLockEffect(focused || mergedOpen, () => {
    if (!focused) {
      activeListRef.current = [];
      updateSubmitIndex(null);
    }
  });

  React.useEffect(() => {
    if (focused) {
      activeListRef.current.push(activeIndex);
    }
  }, [focused, activeIndex]);

  return [
    focused,
    triggerFocus,
    lastOperation,
    activeIndex,
    setActiveIndex,
    nextActiveIndex,
    activeListRef.current,
    updateSubmitIndex,
    hasActiveSubmitValue,
  ];
}

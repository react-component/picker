import * as React from 'react';

export type OperationType = 'input' | 'panel';

export type NextActive = () => number | null;

/**
 * When user first focus one input, any submit will trigger focus another one.
 * When second time focus one input, submit will not trigger focus again.
 * When click outside to close the panel, trigger event if it can trigger onChange.
 */
export default function useRangeActive(
  open: boolean,
  disabled: [boolean, boolean],
  // complexPicker: boolean,
  // needConfirm: boolean,
): [
  activeIndex: number,
  setActiveIndex: (index: number) => void,
  focused: boolean,
  triggerFocus: (focused: boolean) => void,
  lastOperation: (type?: OperationType) => OperationType,
  nextActiveIndex: NextActive,
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
  const nextActiveIndex: NextActive = () => {
    const list = activeListRef.current;
    const activeSet = new Set(list);
    const nextIndex = list[list.length - 1] === 0 ? 1 : 0;

    if (activeSet.size >= 2 || disabled[nextIndex]) {
      return null;
    }

    return nextIndex;
  };

  // ============================= Effect =============================
  // Record for the open timing `activeIndex`
  React.useEffect(() => {
    if (!open) {
      activeListRef.current = [];
    } else {
      activeListRef.current.push(activeIndex);
    }
  }, [open, activeIndex]);

  return [activeIndex, setActiveIndex, focused, triggerFocus, lastOperation, nextActiveIndex];
}

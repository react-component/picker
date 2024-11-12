import * as React from 'react';

export default function useRangeActiveLock(): [
  focused: boolean,
  triggerFocus: (focused: boolean) => void,
  // lastOperation: (type?: OperationType) => OperationType,
  // activeIndex: number,
  setActiveIndex: (index: number) => void,
  // nextActiveIndex: NextActive<DateType>,
  // activeList: number[],
] {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [focused, setFocused] = React.useState<boolean>(false);
  const [activeList, setActiveList] = React.useState<number[]>([]);

  // ============================= Active =============================
  const onActive = (index: number) => {
    setActiveIndex(index);
    setActiveList([...activeList, index]);
  };

  return [focused, setFocused, onActive];
}

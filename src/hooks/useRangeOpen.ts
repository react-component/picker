import { useMergedState } from 'rc-util';
import useEvent from 'rc-util/lib/hooks/useEvent';
import raf from 'rc-util/lib/raf';
import * as React from 'react';

/**
 * 1. Click input to show picker
 * 2. Calculate next open index
 *
 * If click `confirm`:
 * 3. Hide current picker
 * 4. Open next index picker if exist
 *
 * If not `changeOnBlur` and click outside:
 * 3. Hide picker
 *
 * If `changeOnBlur` and click outside:
 * 3. Hide current picker
 * 4. Open next index picker if exist
 */

export type SourceType = 'open' | 'blur' | 'confirm' | 'cancel';

/**
 * Auto control of open state
 */
export default function useRangeOpen(
  defaultOpen: boolean,
  open: boolean,
  activePickerIndex: 0 | 1 | undefined,
  changeOnBlur: boolean,
  startInputRef: React.RefObject<HTMLInputElement>,
  endInputRef: React.RefObject<HTMLInputElement>,
): [
  open: boolean,
  activeIndex: 0 | 1,
  triggerOpen: (open: boolean, activeIndex: 0 | 1, source: SourceType) => void,
] {
  const [mergedOpen, setMergedOpen] = useMergedState(defaultOpen || false, {
    value: open,
  });

  const [mergedActivePickerIndex, setMergedActivePickerIndex] = useMergedState<0 | 1>(0, {
    value: activePickerIndex,
  });

  const [nextActiveIndex, setNextActiveIndex] = React.useState<0 | 1>(null);

  const triggerOpen = useEvent((nextOpen: boolean, index: 0 | 1, source: SourceType) => {
    console.log('✅', nextOpen, index, source, '>>>', nextActiveIndex);

    if (nextOpen) {
      setMergedActivePickerIndex(index);
      setMergedOpen(nextOpen);

      // Record next open index
      if (!mergedOpen) {
        setNextActiveIndex(index === 0 ? 1 : 0);
      } else if (nextActiveIndex !== null) {
        setNextActiveIndex(null);
      }
    } else if (source === 'confirm' || (source === 'blur' && changeOnBlur)) {
      if (nextActiveIndex !== null) {
        setMergedActivePickerIndex(nextActiveIndex);
      }
      setNextActiveIndex(null);

      // Focus back
      if (nextActiveIndex !== null) {
        raf(() => {
          const ref = [startInputRef, endInputRef][nextActiveIndex];
          ref.current?.focus();
        });
      } else {
        setMergedOpen(false);
      }
    } else {
      setMergedOpen(false);
    }
  });

  return [mergedOpen, mergedActivePickerIndex, triggerOpen];
}

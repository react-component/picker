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

export type SourceType = 'open' | 'blur' | 'confirm' | 'cancel' | 'clear' | 'preset';

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
  startSelectedValue: any,
  endSelectedValue: any,
  onOpenChange?: (open: boolean) => void,
): [
  open: boolean,
  activeIndex: 0 | 1,
  firstTimeOpen: boolean,
  triggerOpen: (open: boolean, activeIndex: 0 | 1 | false, source: SourceType) => void,
] {
  const [firstTimeOpen, setFirstTimeOpen] = React.useState(false);

  const [mergedOpen, setMergedOpen] = useMergedState(defaultOpen || false, {
    value: open,
    onChange: (nextOpen) => {
      onOpenChange?.(nextOpen);
    },
  });

  const [mergedActivePickerIndex, setMergedActivePickerIndex] = useMergedState<0 | 1>(0, {
    value: activePickerIndex,
  });

  const [nextActiveIndex, setNextActiveIndex] = React.useState<0 | 1>(null);

  React.useEffect(() => {
    if (mergedOpen) {
      setFirstTimeOpen(true);
    }
  }, [mergedOpen]);

  const triggerOpen = useEvent((nextOpen: boolean, index: 0 | 1 | false, source: SourceType) => {
    if (index === false) {
      // Only when `nextOpen` is false and no need open to next index
      setMergedOpen(nextOpen);
    } else if (nextOpen) {
      setMergedActivePickerIndex(index);
      setMergedOpen(nextOpen);

      const nextIndex = index === 0 ? 1 : 0;

      // Record next open index
      if (
        !mergedOpen ||
        // Also set next index if next is empty
        ![startSelectedValue, endSelectedValue][nextIndex]
      ) {
        setNextActiveIndex(nextIndex);
      } else {
        setFirstTimeOpen(false);

        if (nextActiveIndex !== null) {
          setNextActiveIndex(null);
        }
      }
    } else if (source === 'confirm' || (source === 'blur' && changeOnBlur)) {
      if (nextActiveIndex !== null) {
        setFirstTimeOpen(false);
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

  return [mergedOpen, mergedActivePickerIndex, firstTimeOpen, triggerOpen];
}

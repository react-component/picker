import { useEvent, useMergedState } from 'rc-util';
import raf from 'rc-util/lib/raf';
import * as React from 'react';
import type { OpenConfig } from '../../interface';

/**
 * Control the open state.
 * Will not close if activeElement is on the popup.
 */
export default function useOpen(
  open?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (open: boolean) => void,
): [open: boolean, setOpen: (open: boolean, config?: OpenConfig) => void] {
  const [mergedOpen, setMergeOpen] = useMergedState(defaultOpen || false, {
    value: open,
    // onChange: onOpenChange,
  });

  // Delay for handle the open state, in case fast shift from `open` -> `close` -> `open`
  const mountedRef = React.useRef(false);
  const [effectOpen, setEffectOpen] = React.useState(mergedOpen);

  React.useEffect(() => {
    const syncOpen = () => {
      setEffectOpen(mergedOpen);

      if (mountedRef.current && onOpenChange && mergedOpen !== effectOpen) {
        onOpenChange(mergedOpen);
      }
    };

    if (mergedOpen) {
      syncOpen();
    } else {
      const id = raf(syncOpen);
      return () => {
        raf.cancel(id);
      };
    }
  }, [mergedOpen]);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Open function
  const setOpen = useEvent((nextOpen: boolean, option: OpenConfig = {}) => {
    if (
      // Always keep sync
      !option.inherit ||
      // Set only when current is the same
      nextOpen === effectOpen
    ) {
      setMergeOpen(nextOpen);
    }
  });

  return [effectOpen, setOpen];
}

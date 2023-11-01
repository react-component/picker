import type { OpenConfig } from '../../interface';
import useLockState from './useLockState';

/**
 * Control the open state.
 * Will not close if activeElement is on the popup.
 */
export default function useOpen(
  open?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (open: boolean) => void,
): [open: boolean, setOpen: (open: boolean, config?: OpenConfig) => void] {
  // Delay for handle the open state, in case fast shift from `open` -> `close` -> `open`
  const [rafOpen, setRafOpen] = useLockState(open, defaultOpen || false, onOpenChange);

  function setOpen(next: boolean, config: OpenConfig = {}) {
    if (!config.inherit || rafOpen) {
      setRafOpen(next);
    }
  }

  return [rafOpen, setOpen];
}

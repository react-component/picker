import type { InternalMode, PanelMode } from '../../interface';

export default function useShowNow(
  picker: InternalMode,
  mode: PanelMode,
  showNow?: boolean,
  showToday?: boolean,
) {
  if (mode !== 'date') {
    return false;
  }

  if (showNow !== undefined) {
    return showNow;
  }

  // Compatible with old version `showToday`
  if (picker === 'date' && showToday === false) {
    return showToday;
  }

  return true;
}

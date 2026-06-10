import { useEvent } from '@rc-component/util';
import useLayoutEffect from '@rc-component/util/lib/hooks/useLayoutEffect';
import raf from '@rc-component/util/lib/raf';
import * as React from 'react';
import type { PanelMode } from '../../interface';

/**
 * Move DOM focus to the panel's active cell (or the panel container as a
 * fallback). Centralizes the `[tabindex="0"]` lookup shared across the pickers.
 */
export function focusPopupActiveCell(popupRef: React.RefObject<HTMLElement>) {
  const popup = popupRef.current;
  if (!popup) {
    return;
  }

  // Fall back through progressively looser targets so focus always lands on a
  // cell the user can act on — e.g. when the roving active cell is outside the
  // panel currently shown for the active field. Cells that aren't the active
  // one keep `tabindex="-1"` but are still focusable programmatically; arrow
  // keys then re-establish the roving tabindex from there.
  const target =
    // 1. The roving-tabindex active cell.
    popup.querySelector<HTMLElement>('td[tabindex="0"], li[tabindex="0"]') ||
    // 2. The selected or today cell.
    popup.querySelector<HTMLElement>(
      'td[aria-selected="true"], li[aria-selected="true"], td[aria-current="date"]',
    ) ||
    // 3. The first navigable (non-disabled) date item.
    popup.querySelector<HTMLElement>(
      'td[role="gridcell"]:not([aria-disabled="true"]), li[role="option"]:not([aria-disabled="true"])',
    );

  // Last resort: the dialog container itself.
  (target ?? popup).focus();
}

/**
 * Shared keyboard-focus handoff between the selector input and the popup panel.
 *
 * - On open: focus stays on the selector input (so the user can keep typing).
 * - On drill-down while open (e.g. Date → Month → Year): move focus to the
 *   active cell of the newly shown panel. This is driven from here — rather than
 *   from inside `PickerPanel` — because the range picker remounts its
 *   `PickerPanel`(s) on these transitions (it switches between one and two
 *   panels), which would reset any panel-local mode tracking. We only treat a
 *   mode change as a drill-down when `activeIndex` is unchanged: a range picker
 *   with a per-field `mode` (e.g. `['year', 'month']`) also changes `mergedMode`
 *   when the user switches input fields, and that must not steal focus into the
 *   panel.
 * - On close while focus is still inside the panel (e.g. Enter on a cell, or
 *   Escape — which the popup closes on its own): return focus to the selector
 *   input.
 *
 * Focusing the selector triggers its `onFocus`, which would normally reopen the
 * popup. `isFocusOpenSuppressed()` lets the caller skip that reopen for the
 * focus moves initiated here.
 */
export default function usePopupFocus(
  mergedOpen: boolean,
  mergedMode: PanelMode,
  activeIndex: number,
  popupRef: React.RefObject<HTMLElement>,
  focusSelector: () => void,
) {
  // While a programmatic focus move is in flight, the resulting `focus` event
  // must not be treated as a user interaction: focusing the selector would
  // otherwise reopen the popup, and focusing a panel cell would fire the
  // popup's `onFocus` (→ `triggerOpen(true)`) and cancel a pending close. The
  // caller checks `isFocusOpenSuppressed()` in both `onSelectorFocus` and
  // `onPanelFocus` to skip those reopens. The flag clears on the next microtask,
  // after the synchronous focus event has been dispatched.
  const suppressRef = React.useRef(false);

  const runSuppressed = (focus: () => void) => {
    suppressRef.current = true;
    focus();
    Promise.resolve().then(() => {
      suppressRef.current = false;
    });
  };

  const focusSelectorSuppressed = useEvent(() => {
    runSuppressed(focusSelector);
  });

  const focusPanelSuppressed = useEvent(() => {
    runSuppressed(() => focusPopupActiveCell(popupRef));
  });

  // >>> On close, return focus to the selector when it was left in the panel
  // Opening keeps focus on the input (so the user can keep typing); we only act
  // on *close*, and only when focus currently sits inside the panel — e.g. after
  // Enter/Space on a date cell, or Escape. Without this the focused cell unmounts
  // and focus falls back to <body>. We never run on outside-click close (focus is
  // still on the input then), so the input isn't spuriously re-focused.
  //
  // The focus move is deferred one frame so a *transient* close doesn't steal
  // focus: the range picker briefly closes while switching from the start field
  // to the end field, and reopens on the same tick. That reopen re-runs this
  // effect and its cleanup cancels the pending frame, leaving the field-switch
  // focus (the next input) untouched. A genuine close stays closed, so the
  // frame fires and focus returns to the input.
  useLayoutEffect(() => {
    if (!mergedOpen && popupRef.current?.contains(document.activeElement)) {
      const rafId = raf(() => {
        focusSelectorSuppressed();
      });
      return () => raf.cancel(rafId);
    }
    return undefined;
  }, [mergedOpen]);

  // >>> Drill-down (a mode change with no field switch) while open
  const prevModeRef = React.useRef(mergedMode);
  const prevActiveIndexRef = React.useRef(activeIndex);
  useLayoutEffect(() => {
    const modeChanged = prevModeRef.current !== mergedMode;
    const fieldSwitched = prevActiveIndexRef.current !== activeIndex;
    prevModeRef.current = mergedMode;
    prevActiveIndexRef.current = activeIndex;

    if (mergedOpen && modeChanged && !fieldSwitched) {
      const rafId = raf(() => {
        focusPanelSuppressed();
      });
      return () => raf.cancel(rafId);
    }
    return undefined;
    // `mergedOpen` is read at fire time; we only want to react to mode changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergedMode, activeIndex]);

  return {
    isFocusOpenSuppressed: () => suppressRef.current,
  };
}

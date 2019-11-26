import KeyCode from 'rc-util/lib/KeyCode';
import { PanelMode, PickerMode } from '../interface';

const scrollMap = new Map<string, number>();

/* eslint-disable no-param-reassign */
export function scrollTo(
  element: HTMLElement,
  to: number,
  duration: number,
  key?: string,
) {
  if (key) {
    cancelAnimationFrame(scrollMap.get(key)!);
  }

  // jump to target if duration zero
  if (duration <= 0) {
    const id = requestAnimationFrame(() => {
      element.scrollTop = to;

      // Clean up the key
      if (key) {
        scrollMap.delete(key);
      }
    });

    if (key) {
      scrollMap.set(key, id);
    }

    return;
  }
  const difference = to - element.scrollTop;
  const perTick = (difference / duration) * 10;

  const lid = requestAnimationFrame(() => {
    element.scrollTop += perTick;
    if (element.scrollTop === to) return;
    scrollTo(element, to, duration - 10);
  });

  if (key) {
    scrollMap.set(key, lid);
  }
}
/* eslint-enable */

export interface KeyboardConfig {
  onLeftRight?: ((diff: number) => void) | null;
  onCtrlLeftRight?: ((diff: number) => void) | null;
  onUpDown?: ((diff: number) => void) | null;
  onPageUpDown?: ((diff: number) => void) | null;
  onEnter?: (() => void) | null;
}
export function createKeyDownHandler(
  event: React.KeyboardEvent<HTMLElement>,
  {
    onLeftRight,
    onCtrlLeftRight,
    onUpDown,
    onPageUpDown,
    onEnter,
  }: KeyboardConfig,
): boolean {
  const { which, ctrlKey, metaKey } = event;

  switch (which) {
    case KeyCode.LEFT:
      if (ctrlKey || metaKey) {
        if (onCtrlLeftRight) {
          onCtrlLeftRight(-1);
          return true;
        }
      } else if (onLeftRight) {
        onLeftRight(-1);
        return true;
      }
      break;
    case KeyCode.RIGHT:
      if (ctrlKey || metaKey) {
        if (onCtrlLeftRight) {
          onCtrlLeftRight(1);
          return true;
        }
      } else if (onLeftRight) {
        onLeftRight(1);
        return true;
      }
      break;

    case KeyCode.UP:
      if (onUpDown) {
        onUpDown(-1);
        return true;
      }
      break;
    case KeyCode.DOWN:
      if (onUpDown) {
        onUpDown(1);
        return true;
      }
      break;

    case KeyCode.PAGE_UP:
      if (onPageUpDown) {
        onPageUpDown(-1);
        return true;
      }
      break;
    case KeyCode.PAGE_DOWN:
      if (onPageUpDown) {
        onPageUpDown(1);
        return true;
      }
      break;

    case KeyCode.ENTER:
      if (onEnter) {
        onEnter();
        return true;
      }
      break;
  }

  return false;
}

// ====================== Mode ======================
const getYearNextMode = (next: PanelMode): PanelMode => {
  if (next === 'date') {
    return 'month';
  }
  return next;
};

const getMonthNextMode = (next: PanelMode): PanelMode => {
  if (next === 'date') {
    return 'month';
  }
  return next;
};

const getWeekNextMode = (next: PanelMode): PanelMode => {
  if (next === 'date') {
    return 'week';
  }
  return next;
};

export const PickerModeMap: Record<
  PickerMode,
  ((next: PanelMode) => PanelMode) | null
> = {
  year: getYearNextMode,
  month: getMonthNextMode,
  week: getWeekNextMode,
  time: null,
  date: null,
};

import KeyCode from 'rc-util/lib/KeyCode';

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

interface KeyboardConfig {
  onLeftRight?: (diff: number) => void;
  onCtrlLeftRight?: (diff: number) => void;
  onUpDown?: (diff: number) => void;
  onPageUpDown?: (diff: number) => void;
  onEnter?: () => void;
}
export function createKeyboardRef(
  event: React.KeyboardEvent<HTMLElement>,
  {
    onLeftRight,
    onCtrlLeftRight,
    onUpDown,
    onPageUpDown,
    onEnter,
  }: KeyboardConfig,
) {
  const { which, ctrlKey, metaKey } = event;

  switch (which) {
    case KeyCode.LEFT:
      if (ctrlKey || metaKey) {
        onCtrlLeftRight?.(-1);
      } else {
        onLeftRight?.(-1);
      }
      break;
    case KeyCode.RIGHT:
      if (ctrlKey || metaKey) {
        onCtrlLeftRight?.(1);
      } else {
        onLeftRight?.(1);
      }
      break;

    case KeyCode.UP:
      onUpDown?.(-1);
      break;
    case KeyCode.DOWN:
      onUpDown?.(1);
      break;

    case KeyCode.PAGE_UP:
      onPageUpDown?.(-1);
      break;
    case KeyCode.PAGE_DOWN:
      onPageUpDown?.(1);
      break;

    case KeyCode.ENTER:
      onEnter?.();
      break;
  }
}

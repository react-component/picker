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

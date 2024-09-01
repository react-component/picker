import { useEvent } from 'rc-util';
import raf from 'rc-util/lib/raf';
import isVisible from 'rc-util/lib/Dom/isVisible';
import * as React from 'react';

const SPEED_PTG = 1 / 3;

export default function useScrollTo(
  ulRef: React.RefObject<HTMLUListElement>,
  value: number | string,
): [syncScroll: VoidFunction, clearScroll: VoidFunction, isScrolling: () => boolean] {
  // ========================= Scroll =========================
  const scrollingRef = React.useRef<boolean>(false);
  const scrollRafRef = React.useRef<number>(null);
  const scrollDistRef = React.useRef<number>(null);

  const isScrolling = () => scrollingRef.current;

  const stopScroll = () => {
    raf.cancel(scrollRafRef.current);
    scrollingRef.current = false;
  };

  const scrollRafTimesRef = React.useRef<number>();

  const startScroll = () => {
    const ul = ulRef.current;
    scrollDistRef.current = null;
    scrollRafTimesRef.current = 0;

    if (ul) {
      const targetLi = ul.querySelector<HTMLLIElement>(`[data-value="${value}"]`);
      const firstLi = ul.querySelector<HTMLLIElement>(`li`);

      const doScroll = () => {
        stopScroll();
        scrollingRef.current = true;
        scrollRafTimesRef.current += 1;

        const { scrollTop: currentTop } = ul;

        const firstLiTop = firstLi.offsetTop;
        const targetLiTop = targetLi.offsetTop;
        const targetTop = targetLiTop - firstLiTop;

        // Wait for element exist. 5 frames is enough
        if ((targetLiTop === 0 && targetLi !== firstLi) || !isVisible(ul)) {
          if (scrollRafTimesRef.current <= 5) {
            scrollRafRef.current = raf(doScroll);
          }
          return;
        }

        const nextTop = currentTop + (targetTop - currentTop) * SPEED_PTG;
        const dist = Math.abs(targetTop - nextTop);

        // Break if dist get larger, which means user is scrolling
        if (scrollDistRef.current !== null && scrollDistRef.current < dist) {
          stopScroll();
          return;
        }
        scrollDistRef.current = dist;

        // Stop when dist is less than 1
        if (dist <= 1) {
          ul.scrollTop = targetTop;
          stopScroll();
          return;
        }

        // IE not support `scrollTo`
        ul.scrollTop = nextTop;

        scrollRafRef.current = raf(doScroll);
      };

      if (targetLi && firstLi) {
        doScroll();
      }
    }
  };

  // ======================== Trigger =========================
  const syncScroll = useEvent(startScroll);

  return [syncScroll, stopScroll, isScrolling];
}

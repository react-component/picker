import { useEvent } from 'rc-util';
import raf from 'rc-util/lib/raf';
import * as React from 'react';

const SPEED_PTG = 1 / 5;

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

  const startScroll = (targetTop: number) => {
    const ul = ulRef.current;
    scrollDistRef.current = null;

    if (ul) {
      const doScroll = () => {
        stopScroll();
        scrollingRef.current = true;

        const currentTop = ul.scrollTop;
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

      doScroll();
    }
  };

  // ======================== Trigger =========================
  const syncScroll = useEvent(() => {
    const ul = ulRef.current;
    const targetLi = ul?.querySelector<HTMLLIElement>(`[data-value="${value}"]`);

    if (targetLi) {
      const firstLiTop = ul.querySelector<HTMLLIElement>(`li`).offsetTop;
      const targetLiTop = targetLi.offsetTop;

      const nextTop = targetLiTop - firstLiTop;

      startScroll(nextTop);
    }
  });

  return [syncScroll, stopScroll, isScrolling];
}

import classNames from 'classnames';
import { useEvent } from 'rc-util';
import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import raf from 'rc-util/lib/raf';
import * as React from 'react';
import { PanelContext } from '../../context';

const SCROLL_DELAY = 500;

export type Unit<ValueType = number | string> = {
  label: React.ReactText;
  value: ValueType;
  disabled?: boolean;
};

export interface TimeUnitColumnProps {
  units: Unit[];
  value: number | string;
  optionalValue?: number | string;
  type: 'hour' | 'minute' | 'second' | 'millisecond' | 'meridiem';
  onChange: (value: number | string) => void;
  changeOnScroll?: boolean;
  showTitle?: boolean;
  title?: React.ReactNode;
}

export default function TimeColumn(props: TimeUnitColumnProps) {
  const { showTitle, title, units, value, optionalValue, type, onChange, changeOnScroll } = props;

  const { prefixCls, cellRender, now, locale } = React.useContext(PanelContext);

  const panelPrefixCls = `${prefixCls}-time-panel`;
  const cellPrefixCls = `${prefixCls}-time-panel-cell`;

  // ========================== Refs ==========================
  const ulRef = React.useRef<HTMLUListElement>(null);

  // ========================= Scroll =========================
  const timeoutRef = React.useRef<any>();

  const cleanScroll = () => {
    clearTimeout(timeoutRef.current!);
  };

  const scrollRafRef = React.useRef<number>(null);

  // Scroll to value position
  const scrollToValue = useEvent((val: number | string) => {
    raf.cancel(scrollRafRef.current);

    // Do not trigger realign by this effect scroll
    setTimeout(cleanScroll, 100);

    scrollRafRef.current = raf(() => {
      const ul = ulRef.current;
      const targetLi = ul?.querySelector<HTMLLIElement>(`[data-value="${val}"]`);

      if (targetLi) {
        const firstLiTop = ul.querySelector<HTMLLIElement>(`li`).offsetTop;
        const targetLiTop = targetLi.offsetTop;

        const nextTop = targetLiTop - firstLiTop;

        // IE not support `scrollTo`
        ul.scrollTop = nextTop;
      }
    });
  });

  // Effect sync value scroll
  useLayoutEffect(() => {
    scrollToValue(value ?? optionalValue);
  }, [value, optionalValue, units, scrollToValue]);

  // Scroll event if sync onScroll
  const onInternalScroll: React.UIEventHandler<HTMLUListElement> = (event) => {
    const target = event.target as HTMLUListElement;

    if (changeOnScroll) {
      cleanScroll();

      timeoutRef.current = setTimeout(() => {
        const ul = ulRef.current!;

        const firstLiTop = ul.querySelector<HTMLLIElement>(`li`).offsetTop;
        const liList = Array.from(ul.querySelectorAll<HTMLLIElement>(`li`));
        const liTopList = liList.map((li) => li.offsetTop - firstLiTop);

        const liDistList = liTopList.map((top, index) => {
          if (units[index].disabled) {
            return Number.MAX_SAFE_INTEGER;
          }
          return Math.abs(top - target.scrollTop);
        });

        // Find min distance index
        const minDist = Math.min(...liDistList);
        const minDistIndex = liDistList.findIndex((dist) => dist === minDist);

        const targetUnit = units[minDistIndex];
        if (targetUnit && !targetUnit.disabled) {
          onChange(targetUnit.value);
          scrollToValue(targetUnit.value);
        }
      }, SCROLL_DELAY);
    }
  };

  // ========================= Render =========================
  const columnPrefixCls = `${panelPrefixCls}-column`;
  const columnHolderPrefixCls = `${columnPrefixCls}-holder`;

  return (
    <div
      className={classNames(columnHolderPrefixCls, {
        [`${columnHolderPrefixCls}-show-title`]: showTitle,
      })}
      data-type={type}
    >
      {showTitle && (
        <div className={`${columnPrefixCls}-title`}>
          {title !== undefined ? title || '\u00A0' : type}
        </div>
      )}

      <ul className={columnPrefixCls} ref={ulRef} onScroll={onInternalScroll}>
        {units.map(({ label, value: unitValue, disabled }) => {
          const inner = <div className={`${cellPrefixCls}-inner`}>{label}</div>;

          return (
            <li
              key={unitValue}
              className={classNames(cellPrefixCls, {
                [`${cellPrefixCls}-selected`]: value === unitValue,
                [`${cellPrefixCls}-disabled`]: disabled,
              })}
              onClick={() => {
                if (!disabled) {
                  onChange(unitValue);
                }
              }}
              data-value={unitValue}
            >
              {cellRender
                ? cellRender(unitValue, {
                    prefixCls,
                    originNode: inner,
                    today: now,
                    type: 'time',
                    subType: type,
                    locale,
                  })
                : inner}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

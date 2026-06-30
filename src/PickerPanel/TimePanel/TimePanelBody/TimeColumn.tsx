import { clsx } from 'clsx';
import { useLayoutEffect } from '@rc-component/util';
import * as React from 'react';
import { usePanelContext } from '../../context';
import useScrollTo from './useScrollTo';
import type { Locale } from '../../../interface';

const SCROLL_DELAY = 300;

export type Unit<ValueType = number | string> = {
  label: string | number;
  value: ValueType;
  disabled?: boolean;
};

type TimeUnitType = 'hour' | 'minute' | 'second' | 'millisecond' | 'meridiem';

export interface TimeUnitColumnProps {
  units: Unit[];
  value: number | string;
  optionalValue?: number | string;
  type: TimeUnitType;
  onChange: (value: number | string) => void;
  onHover: (value: number | string) => void;
  onDblClick?: VoidFunction;
  changeOnScroll?: boolean;
}

// Not use JSON.stringify to avoid dead loop
function flattenUnits(units: Unit<string | number>[]) {
  return units.map(({ value, label, disabled }) => [value, label, disabled].join(',')).join(';');
}

const LIST_LABEL_MAP: Record<TimeUnitType, (locale: Locale) => string> = {
  hour: (locale) => locale.hourSelect,
  minute: (locale) => locale.minuteSelect,
  second: (locale) => locale.secondSelect,
  millisecond: (locale) => locale.millisecondSelect,
  meridiem: (locale) => locale.meridiemSelect,
};

const LIST_ITEM_LABEL_MAP: Record<
  TimeUnitType,
  (value: string | number, locale: Locale) => string
> = {
  hour: (value, locale) => `${value} ${locale.hours}`,
  minute: (value, locale) => `${value} ${locale.minutes}`,
  second: (value, locale) => `${value} ${locale.seconds}`,
  millisecond: (value, locale) => `${value} ${locale.milliseconds}`,
  meridiem: (value) => value.toString(),
};

export default function TimeColumn<DateType extends object>(props: TimeUnitColumnProps) {
  const { units, value, optionalValue, type, onChange, onHover, onDblClick, changeOnScroll } =
    props;

  const { prefixCls, cellRender, now, locale, classNames, styles } = usePanelContext<DateType>();

  const panelPrefixCls = `${prefixCls}-time-panel`;
  const cellPrefixCls = `${prefixCls}-time-panel-cell`;

  // ========================== Refs ==========================
  const ulRef = React.useRef<HTMLUListElement>(null);

  // ========================= Scroll =========================
  const checkDelayRef = React.useRef<any>();

  const clearDelayCheck = () => {
    clearTimeout(checkDelayRef.current);
  };

  // ========================== Sync ==========================
  const [syncScroll, stopScroll, isScrolling] = useScrollTo(ulRef, value ?? optionalValue);

  // Effect sync value scroll
  useLayoutEffect(() => {
    syncScroll();
    clearDelayCheck();

    return () => {
      stopScroll();
      clearDelayCheck();
    };
  }, [value, optionalValue, flattenUnits(units)]);

  // ========================= Change =========================
  // Scroll event if sync onScroll
  const onInternalScroll: React.UIEventHandler<HTMLUListElement> = (event) => {
    clearDelayCheck();

    const target = event.target as HTMLUListElement;

    if (!isScrolling() && changeOnScroll) {
      checkDelayRef.current = setTimeout(() => {
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
        }
      }, SCROLL_DELAY);
    }
  };

  // ========================= Render =========================
  const columnPrefixCls = `${panelPrefixCls}-column`;

  return (
    <ul
      role="listbox"
      aria-label={LIST_LABEL_MAP[type](locale)}
      className={columnPrefixCls}
      ref={ulRef}
      data-type={type}
      onScroll={onInternalScroll}
    >
      {units.map(({ label, value: unitValue, disabled }) => {
        const inner = <div className={`${cellPrefixCls}-inner`}>{label}</div>;
        const isSelected = value === unitValue;

        return (
          <li
            key={unitValue}
            aria-label={LIST_ITEM_LABEL_MAP[type](unitValue, locale)}
            role="option"
            aria-selected={isSelected}
            aria-disabled={disabled}
            style={styles.item}
            className={clsx(cellPrefixCls, classNames.item, {
              [`${cellPrefixCls}-selected`]: isSelected,
              [`${cellPrefixCls}-disabled`]: disabled,
            })}
            onClick={() => {
              if (!disabled) {
                onChange(unitValue);
              }
            }}
            onDoubleClick={() => {
              if (!disabled && onDblClick) {
                onDblClick();
              }
            }}
            onMouseEnter={() => {
              onHover(unitValue);
            }}
            onMouseLeave={() => {
              onHover(null);
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
  );
}

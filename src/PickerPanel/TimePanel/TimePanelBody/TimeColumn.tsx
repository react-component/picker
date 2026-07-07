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

function getListLabel(type: TimeUnitType, locale: Locale) {
  switch (type) {
    case 'hour':
      return locale.hourSelect;
    case 'minute':
      return locale.minuteSelect;
    case 'second':
      return locale.secondSelect;
    case 'millisecond':
      return locale.millisecondSelect;
    case 'meridiem':
      return locale.meridiemSelect;
    default:
      return '';
  }
}

function getListItemLabel(type: TimeUnitType, value: string | number, locale: Locale) {
  switch (type) {
    case 'hour':
      return `${value} ${locale.hours}`;
    case 'minute':
      return `${value} ${locale.minutes}`;
    case 'second':
      return `${value} ${locale.seconds}`;
    case 'millisecond':
      return `${value} ${locale.milliseconds}`;
    case 'meridiem':
      return value.toString();
    default:
      return '';
  }
}

export default function TimeColumn<DateType extends object>(props: TimeUnitColumnProps) {
  const { units, value, optionalValue, type, onChange, onHover, onDblClick, changeOnScroll } =
    props;

  const { prefixCls, cellRender, now, locale, classNames, styles } = usePanelContext<DateType>();

  const panelPrefixCls = `${prefixCls}-time-panel`;
  const cellPrefixCls = `${prefixCls}-time-panel-cell`;

  // ========================== Refs ==========================
  const ulRef = React.useRef<HTMLUListElement>(null);

  // ========================= Scroll =========================
  const checkDelayRef = React.useRef<any>(undefined);

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

  const columnPrefixCls = `${panelPrefixCls}-column`;

  // ========================= Focus =========================
  const activeValue = value ?? optionalValue;

  // Tracks keyboard-navigation cursor separately from the committed value.
  const [focusedValue, setFocusedValue] = React.useState<number | string | null>(null);

  // Reset cursor when the committed value changes (e.g. click or external update).
  React.useEffect(() => {
    setFocusedValue(null);
  }, [value]);

  const tabFocusValue = focusedValue ?? activeValue;

  // The active option registers its node via a callback ref; after keyboard
  // navigation we move DOM focus to it without querying the DOM.
  const focusedLiNodeRef = React.useRef<HTMLElement | null>(null);
  const pendingFocusRef = React.useRef(false);

  const registerFocusedLi = React.useCallback((node: HTMLElement | null) => {
    focusedLiNodeRef.current = node;
  }, []);

  React.useEffect(() => {
    if (pendingFocusRef.current) {
      pendingFocusRef.current = false;
      focusedLiNodeRef.current?.focus();
    }
  }, [focusedValue]);

  // ========================= Keyboard =========================
  const onCellKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
    const enabledUnits = units.filter((u) => !u.disabled);
    const currentIdx = enabledUnits.findIndex((u) => u.value === tabFocusValue);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      pendingFocusRef.current = true;
      const next = currentIdx < enabledUnits.length - 1 ? currentIdx + 1 : 0;
      setFocusedValue(enabledUnits[next]?.value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      pendingFocusRef.current = true;
      const prev = currentIdx > 0 ? currentIdx - 1 : enabledUnits.length - 1;
      setFocusedValue(enabledUnits[prev]?.value);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const target = enabledUnits.find((u) => u.value === tabFocusValue);
      if (target) {
        onChange(target.value);
      }
    }
  };

  // ========================= Render =========================
  return (
    <ul
      role="listbox"
      aria-label={getListLabel(type, locale)}
      className={columnPrefixCls}
      ref={ulRef}
      data-type={type}
      onScroll={onInternalScroll}
      onBlur={(e) => {
        if (!ulRef.current?.contains(e.relatedTarget as Node)) {
          setFocusedValue(null);
        }
      }}
    >
      {units.map(({ label, value: unitValue, disabled }) => {
        const inner = <div className={`${cellPrefixCls}-inner`}>{label}</div>;
        const isSelected = value === unitValue;

        return (
          <li
            key={unitValue}
            ref={tabFocusValue === unitValue ? registerFocusedLi : undefined}
            aria-label={getListItemLabel(type, unitValue, locale)}
            tabIndex={tabFocusValue === unitValue ? 0 : -1}
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
            onKeyDown={onCellKeyDown}
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

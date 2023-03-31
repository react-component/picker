import * as React from 'react';
import { useRef, useLayoutEffect } from 'react';
import classNames from 'classnames';
import { scrollTo, waitElementReady } from '../../utils/uiUtil';
import PanelContext from '../../PanelContext';
import type { CellRender, Locale } from '@/interface';

export type Unit = {
  label: React.ReactText;
  value: number;
  disabled: boolean;
};

export type TimeUnitColumnProps<DateType> = {
  prefixCls?: string;
  units?: Unit[];
  value?: number;
  active?: boolean;
  hideDisabledOptions?: boolean;
  onSelect?: (value: number) => void;
  type: 'hour' | 'minute' | 'second' | 'meridiem';
  info: {
    today: DateType,
    locale: Locale,
    cellRender: CellRender<DateType, number>,
  }
};

function TimeUnitColumn<DateType>(props: TimeUnitColumnProps<DateType>) {
  const { prefixCls, units, onSelect, value, active, hideDisabledOptions, info, type } = props;
  const cellPrefixCls = `${prefixCls}-cell`;
  const { open } = React.useContext(PanelContext);

  const ulRef = useRef<HTMLUListElement>(null);
  const liRefs = useRef<Map<number, HTMLElement | null>>(new Map());
  const scrollRef = useRef<Function>();

  // `useLayoutEffect` here to avoid blink by duration is 0
  useLayoutEffect(() => {
    const li = liRefs.current.get(value!);
    if (li && open !== false) {
      scrollTo(ulRef.current!, li.offsetTop, 120);
    }
  }, [value]);

  useLayoutEffect(() => {
    if (open) {
      const li = liRefs.current.get(value!);
      if (li) {
        scrollRef.current = waitElementReady(li, () => {
          scrollTo(ulRef.current!, li.offsetTop, 0);
        });
      }
    }

    return () => {
      scrollRef.current?.();
    };
  }, [open]);

  return (
    <ul
      className={classNames(`${prefixCls}-column`, {
        [`${prefixCls}-column-active`]: active,
      })}
      ref={ulRef}
      style={{ position: 'relative' }}
    >
      {units!.map((unit) => {
        if (hideDisabledOptions && unit.disabled) {
          return null;
        }

        return (
          <li
            key={unit.value}
            ref={(element) => {
              liRefs.current.set(unit.value, element);
            }}
            className={classNames(cellPrefixCls, {
              [`${cellPrefixCls}-disabled`]: unit.disabled,
              [`${cellPrefixCls}-selected`]: value === unit.value,
            })}
            onClick={() => {
              if (unit.disabled) {
                return;
              }
              onSelect!(unit.value);
            }}
          >
            {info.cellRender ? info.cellRender(unit.value, {
              today: info.today,
              locale: info.locale,
              originNode: <div className={`${cellPrefixCls}-inner`}>{unit.label}</div>,
              type: 'time',
              subType: type
            }) : <div className={`${cellPrefixCls}-inner`}>{unit.label}</div>}
            
          </li>
        );
      })}
    </ul>
  );
}

export default TimeUnitColumn;

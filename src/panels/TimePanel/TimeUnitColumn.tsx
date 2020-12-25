import * as React from 'react';
import { useRef, useLayoutEffect } from 'react';
import classNames from 'classnames';
import { scrollTo, waitElementReady } from '../../utils/uiUtil';
import PanelContext from '../../PanelContext';

export type Unit = {
  label: React.ReactText;
  value: number;
  disabled: boolean;
};

export type TimeUnitColumnProps = {
  prefixCls?: string;
  units?: Unit[];
  value?: number;
  active?: boolean;
  hideDisabledOptions?: boolean;
  onSelect?: (value: number) => void;
};

function TimeUnitColumn(props: TimeUnitColumnProps) {
  const { prefixCls, units, onSelect, value, active, hideDisabledOptions } = props;
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
            <div className={`${cellPrefixCls}-inner`}>{unit.label}</div>
          </li>
        );
      })}
    </ul>
  );
}

export default TimeUnitColumn;

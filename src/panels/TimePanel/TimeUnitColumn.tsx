import * as React from 'react';
import classNames from 'classnames';
import { scrollTo } from '../../utils/uiUtil';

export interface Unit {
  label: React.ReactText;
  value: number;
  disabled?: boolean;
}

export interface TimeUnitColumnProps {
  prefixCls: string;
  units?: Unit[];
  value?: number;
  active?: boolean;
  onSelect?: (value: number) => void;
}

function TimeUnitColumn(props: TimeUnitColumnProps) {
  const { prefixCls, units, onSelect, value, active } = props;
  const cellPrefixCls = `${prefixCls}-cell`;

  const initRef = React.useRef(true);
  const ulRef = React.useRef<HTMLUListElement>(null);
  const liRefs = React.useRef<Map<number, HTMLElement | null>>(new Map());

  // `useLayoutEffect` here to avoid blink by duration is 0
  React.useLayoutEffect(() => {
    const li = liRefs.current.get(value!);
    if (li) {
      scrollTo(ulRef.current!, li.offsetTop, initRef.current ? 0 : 120);
    }

    initRef.current = false;
  }, [value]);

  return (
    <ul
      className={classNames(`${prefixCls}-column`, {
        [`${prefixCls}-column-active`]: active,
      })}
      ref={ulRef}
      style={{ position: 'relative' }}
    >
      {units!.map(unit => (
        <li
          key={unit.value}
          ref={element => {
            liRefs.current.set(unit.value, element);
          }}
          className={classNames(cellPrefixCls, {
            [`${cellPrefixCls}-disabled`]: unit.disabled,
            [`${cellPrefixCls}-selected`]: value === unit.value,
          })}
        >
          <button
            type="button"
            tabIndex={-1}
            disabled={unit.disabled}
            onClick={() => {
              onSelect!(unit.value);
            }}
          >
            {unit.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default TimeUnitColumn;

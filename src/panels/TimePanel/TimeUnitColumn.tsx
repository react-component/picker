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
  units: Unit[];
  value: number;
  onSelect: (value: number) => void;
}

function TimeUnitColumn(props: TimeUnitColumnProps) {
  const { prefixCls, units, onSelect, value } = props;
  const cellPrefixCls = `${prefixCls}-cell`;

  const initRef = React.useRef(true);
  const ulRef = React.useRef<HTMLUListElement>(null);
  const liRefs = React.useRef<Map<number, HTMLElement | null>>(new Map());

  React.useEffect(() => {
    const li = liRefs.current.get(value);
    if (li) {
      scrollTo(ulRef.current!, li.offsetTop, initRef.current ? 0 : 120);
    }

    initRef.current = false;
  }, [value]);

  return (
    <ul
      className={`${prefixCls}-column`}
      ref={ulRef}
      style={{ position: 'relative' }}
    >
      {units.map(unit => (
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
            disabled={unit.disabled}
            onClick={() => {
              onSelect(unit.value);
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

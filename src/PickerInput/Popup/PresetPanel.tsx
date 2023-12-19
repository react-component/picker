import * as React from 'react';
import type { ValueDate } from '../../interface';

export interface PresetPanelProps<ValueType = any> {
  prefixCls: string;
  presets: ValueDate<ValueType>[];
  onClick: (value: ValueType) => void;
  onHover: (value: ValueType) => void;
}

function executeValue<ValueType extends object>(value: ValueDate<ValueType>['value']): ValueType {
  return typeof value === 'function' ? value() : value;
}

export default function PresetPanel<DateType extends object = any>(
  props: PresetPanelProps<DateType>,
) {
  const { prefixCls, presets, onClick, onHover } = props;

  if (!presets.length) {
    return null;
  }

  return (
    <div className={`${prefixCls}-presets`}>
      <ul>
        {presets.map(({ label, value }, index) => (
          <li
            key={index}
            onClick={() => {
              onClick(executeValue(value));
            }}
            onMouseEnter={() => {
              onHover(executeValue(value));
            }}
            onMouseLeave={() => {
              onHover(null);
            }}
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

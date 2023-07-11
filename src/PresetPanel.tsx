import * as React from 'react';
import type { PresetDate } from './interface';
import { executeValue } from './utils/miscUtil';

export interface PresetPanelProps<T> {
  prefixCls: string;
  presets: PresetDate<T>[];
  onClick: (value: T) => void;
  onHover?: (value: T) => void;
}

export default function PresetPanel<T>(props: PresetPanelProps<T>) {
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
            onClick={() => onClick?.(executeValue(value))}
            onMouseEnter={() => onHover?.(executeValue(value))}
            onMouseLeave={() => onHover?.(null)}
          >
            {label}
          </li>
        ))}
      </ul>
    </div >
  );
}

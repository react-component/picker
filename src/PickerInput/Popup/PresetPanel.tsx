import * as React from 'react';
import type { ValueDate } from '../../interface';
import moment from 'moment';

export interface PresetPanelProps<ValueType = any, DateType extends object = any> {
  prefixCls: string;
  presets: ValueDate<ValueType>[];
  onClick: (value: ValueType) => void;
  onHover: (value: ValueType) => void;
  maxDate?: DateType;
}

function executeValue<ValueType extends object>(value: ValueDate<ValueType>['value']): ValueType {
  return typeof value === 'function' ? value() : value;
}

export default function PresetPanel<DateType extends object = any>(
  props: PresetPanelProps<DateType>,
) {
  const { prefixCls, presets, onClick, onHover, maxDate } = props;

  if (!presets.length) {
    return null;
  }

  return (
    <div className={`${prefixCls}-presets`}>
      <ul>
        {presets.map(({ label, value }, index) => {
          // const isDisabled =
          //   maxDate && moment.isMoment(maxDate)
          //     ? moment(typeof value === 'function' ? value() : value).isAfter(maxDate)
          //     : false;
          const isDisabled = maxDate
            ? moment(typeof value === 'function' ? value() : value).isAfter(maxDate)
            : false;

          return (
            <li
              key={index}
              onClick={() => {
                if (!isDisabled) {
                  onClick(executeValue(value));
                }
              }}
              onMouseEnter={() => {
                if (!isDisabled) {
                  onHover(executeValue(value));
                }
              }}
              onMouseLeave={() => {
                onHover(null);
              }}
            >
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

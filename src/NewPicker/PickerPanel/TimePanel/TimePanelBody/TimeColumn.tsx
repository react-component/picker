import classNames from 'classnames';
import * as React from 'react';
import { PanelContext } from '../../context';

export type Unit = {
  label: React.ReactText;
  value: number | string;
  disabled?: boolean;
};

export interface TimeUnitColumnProps<DateType = any> {
  units: Unit[];
  value: number | string;
  type: 'hour' | 'minute' | 'second' | 'meridiem';
  onChange: (value: number | string) => void;
}

export default function TimeColumn<DateType = any>(props: TimeUnitColumnProps<DateType>) {
  const { units, value, type, onChange } = props;

  const { prefixCls, cellRender, now, locale } = React.useContext(PanelContext);

  const panelPrefixCls = `${prefixCls}-time-panel`;
  const cellPrefixCls = `${prefixCls}-time-panel-cell`;

  // ant-picker-time-panel-cell ant-picker-time-panel-cell-selected
  // ant-picker-time-panel-cell-inner

  return (
    <ul className={`${panelPrefixCls}-column`}>
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
          >
            {cellRender
              ? cellRender(value, {
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

import * as React from 'react';
import type { InternalMode, SharedPanelProps } from '../../interface';
import DatePanel from '../DatePanel';
import TimePanel from '../TimePanel';

export default function DateTimePanel<DateType = any>(props: SharedPanelProps<DateType>) {
  const { prefixCls } = props;

  const panelPrefixCls = `${prefixCls}-datetime-panel`;

  const passProps: SharedPanelProps<DateType> & {
    mode: InternalMode;
  } = {
    ...props,
    mode: 'datetime',
  };

  // ============================== Render ==============================
  return (
    <div className={panelPrefixCls}>
      <DatePanel {...passProps} />
      <TimePanel {...passProps} />
    </div>
  );
}

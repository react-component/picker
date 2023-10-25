import * as React from 'react';
import type { SharedPanelProps } from '../../interface';
import DatePanel from '../DatePanel';
import TimePanel from '../TimePanel';

export default function DateTimePanel<DateType = any>(props: SharedPanelProps<DateType>) {
  const { prefixCls, value, pickerValue } = props;

  const panelPrefixCls = `${prefixCls}-datetime-panel`;

  // ============================== Render ==============================
  return (
    <div className={panelPrefixCls}>
      <DatePanel {...props} />
      <TimePanel {...props} value={value || pickerValue} />
    </div>
  );
}

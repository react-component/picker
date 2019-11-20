import * as React from 'react';
import DatePanel, { DatePanelProps } from '../DatePanel';
import TimePanel, { TimePanelProps } from '../TimePanel';

export type DatetimePanelProps<DateType> = DatePanelProps<DateType> &
  TimePanelProps<DateType>;

function DatetimePanel<DateType>(props: DatetimePanelProps<DateType>) {
  const { prefixCls } = props;
  const panelPrefixCls = `${prefixCls}-datetime-panel`;

  return (
    <div className={panelPrefixCls}>
      <DatePanel {...props} />
      <TimePanel {...props} />
    </div>
  );
}

export default DatetimePanel;

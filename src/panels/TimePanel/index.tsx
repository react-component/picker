import * as React from 'react';
import TimeHeader from './TimeHeader';
import TimeBody from './TimeBody';
import { PanelSharedProps } from '../../interface';

export interface SharedTimeProps {
  showHour?: boolean;
  showMinute?: boolean;
  showSecond?: boolean;
  use12Hours?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
}

export interface TimePanelProps<DateType>
  extends PanelSharedProps<DateType>,
    SharedTimeProps {
  format?: string;
}

function TimePanel<DateType>(props: TimePanelProps<DateType>) {
  const { format = 'HH:mm:ss', prefixCls } = props;
  const panelPrefixCls = `${prefixCls}-time-panel`;

  return (
    <div className={panelPrefixCls}>
      <TimeHeader {...props} format={format} prefixCls={panelPrefixCls} />
      <TimeBody {...props} prefixCls={panelPrefixCls} />
    </div>
  );
}

export default TimePanel;

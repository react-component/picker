import * as React from 'react';
import useTimeInfo from '../../hooks/useTimeInfo';
import type { SharedPanelProps } from '../../../interface';
import DatePanel from '../DatePanel';
import TimePanel from '../TimePanel';

export default function DateTimePanel<DateType extends object = any>(
  props: SharedPanelProps<DateType>,
) {
  const { prefixCls, generateConfig, showTime, onSelect } = props;

  const panelPrefixCls = `${prefixCls}-datetime-panel`;

  // ============================== Select ==============================
  const [getValidTime] = useTimeInfo(generateConfig, showTime);

  const onDateSelect = (date: DateType) => {
    onSelect(getValidTime(date, date));
  };

  // ============================== Render ==============================
  return (
    <div className={panelPrefixCls}>
      <DatePanel {...props} onSelect={onDateSelect} />
      <TimePanel {...props} />
    </div>
  );
}

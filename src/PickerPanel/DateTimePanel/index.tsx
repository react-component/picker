import * as React from 'react';
import useTimeInfo from '../../hooks/useTimeInfo';
import type { SharedPanelProps } from '../../interface';
import { fillTime } from '../../utils/dateUtil';
import DatePanel from '../DatePanel';
import TimePanel from '../TimePanel';

export default function DateTimePanel<DateType extends object = any>(
  props: SharedPanelProps<DateType>,
) {
  const { prefixCls, generateConfig, showTime, onSelect, value } = props;

  const panelPrefixCls = `${prefixCls}-datetime-panel`;

  // ============================== Select ==============================
  const [getValidTime] = useTimeInfo(generateConfig, showTime);

  const onDateSelect = (date: DateType) => {
    // Merge with current time
    const cloneDate = fillTime(generateConfig, date, value);

    onSelect(getValidTime(cloneDate, cloneDate));
  };

  // ============================== Render ==============================
  return (
    <div className={panelPrefixCls}>
      <DatePanel {...props} onSelect={onDateSelect} />
      <TimePanel {...props} />
    </div>
  );
}

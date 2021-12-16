import React, { useState } from 'react';
import type { Moment } from 'moment';
import moment from 'moment';
import RangePicker from '../src/RangePicker';
import type { RangeValue } from '../src/interface';
import momentGenerateConfig from '../src/generate/moment';
import zhCN from '../src/locale/zh_CN';
import '../assets/index.less';
import './common.less';

export default () => {
  const [dates, setDates] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<RangeValue<Moment>>();

  const disabledDate = (current) => {
    if (!dates || dates.length === 0) {
      return false;
    }
    const tooLate = dates[0] && current.diff(dates[0], 'days') > 7;
    const tooEarly = dates[1] && dates[1].diff(current, 'days') > 7;
    return tooEarly || tooLate;
  };

  const onOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      setDates([]);
    }
  };

  return (
    <RangePicker<Moment>
      generateConfig={momentGenerateConfig}
      locale={zhCN}
      value={isOpen ? null : value}
      defaultPickerValue={[moment('2021-06-01'), moment('2021-06-02')]}
      disabledDate={disabledDate}
      onCalendarChange={(val) => setDates(val)}
      onChange={(val) => setValue(val)}
      onOpenChange={onOpenChange}
    />
  );
};

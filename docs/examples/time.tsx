import React from 'react';
import moment from 'moment';
import Picker, { RangePicker } from '../../src';
import momentGenerateConfig from '../../src/generate/moment';
import zhCN from '../../src/locale/zh_CN';
import '../../assets/index.less';

const defaultValue = moment('2019-11-28 01:02:03');

export default () => {
  return (
    <div>
      <h3>DatePicker</h3>
      <Picker
        defaultValue={defaultValue}
        picker="date"
        showTime
        disabledTime={() => ({
          disabledHours: () => [1, 2, 3, 4, 5, 6],
        })}
        locale={zhCN}
        generateConfig={momentGenerateConfig}
      />

      <h3>TimePicker</h3>
      <Picker
        defaultValue={defaultValue}
        picker="time"
        locale={zhCN}
        disabledTime={(now) => ({
          disabledHours: () => [now.hours()],
        })}
        generateConfig={momentGenerateConfig}
      />

      <h3>RangePicker</h3>
      <RangePicker
        defaultValue={[defaultValue, defaultValue]}
        picker="time"
        locale={zhCN}
        generateConfig={momentGenerateConfig}
        disabledTime={(now, type) => ({
          disabledHours: () => (type === 'start' ? [now.hours()] : [now.hours() - 5]),
        })}
      />
    </div>
  );
};

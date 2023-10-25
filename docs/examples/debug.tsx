import * as React from 'react';
import '../../assets/index.less';
import type { PickerRef } from '../../src/NewPicker/interface';
import RangePicker from '../../src/NewPicker/PickerInput/RangePicker';
import SinglePicker from '../../src/NewPicker/PickerInput/SinglePicker';
import PickerPanel, { type PickerPanelProps } from '../../src/NewPicker/PickerPanel';

import moment, { Moment } from 'moment';
import 'moment/locale/zh-cn';
import momentGenerateConfig from '../../src/generate/moment';
import zhCN from '../../src/locale/zh_CN';

moment.locale('zh-cn');
window.moment = moment;

function CellPicker(props: Partial<PickerPanelProps>) {
  return (
    <div>
      <h5 style={{ margin: 0 }}>{props.picker || 'date'}</h5>
      <PickerPanel locale={zhCN} generateConfig={momentGenerateConfig} {...props} />
    </div>
  );
}

export default () => {
  const singleRef = React.useRef<PickerRef>(null);

  const [value, setValue] = React.useState<Moment>(null);

  return (
    <div>
      <SinglePicker ref={singleRef} suffixIcon="🧶" />
      <br />
      <RangePicker suffixIcon="🧶" />
      <br />

      <button
        onClick={() => {
          singleRef.current?.focus();
        }}
      >
        Focus
      </button>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <CellPicker picker="datetime" />

        {/* <CellPicker
          defaultValue={moment().add(1, 'day')}
          disabledDate={(date) => date.date() === 11}
          // cellRender={(date: Moment, info) => {
          //   if (info.type === 'date') {
          //     return date.format('Do');
          //   }
          // }}
          value={value}
          onChange={setValue}
        />

        <CellPicker
          picker="week"
          defaultValue={moment('2000-01-01')}
          disabledDate={(date) => date.week() === 3}
        />

        <CellPicker
          picker="month"
          defaultValue={moment('2000-01-01')}
          disabledDate={(date) => date.week() === 3}
          value={value}
          onChange={setValue}
        />

        <CellPicker
          picker="year"
          defaultValue={moment('2023-04-05')}
          disabledDate={(date) => date.week() === 3}
        />

        <CellPicker
          picker="decade"
          defaultValue={moment('2023-04-05')}
          disabledDate={(date) => date.week() === 3}
        />

        <CellPicker
          picker="time"
          defaultValue={moment('1990-10-23 13:05:08.200')}
          disabledDate={(date) => date.week() === 3}
          showTime={{
            format: 'HH:mm:ss.SSS',
            // format: 'LTS',
            use12Hours: true,
            changeOnScroll: true,
            disabledHours: () => [0, 1, 2, 3, 4, 5],
            disabledMinutes: (hour) => (hour === 6 ? [0, 1, 2, 4, 5, 6] : []),
            disabledSeconds: (_, minute) => (minute === 3 ? [6, 7, 8, 9] : []),
            disabledTime: () => ({
              disabledMilliSeconds: () => [0, 100],
            }),
            showTitle: true,
            millisecondStep: 20,
          }}
          // cellRender={(val: number, info) => {
          //   if (info.type === 'time') {
          //     return `${val}!!!`;
          //   }
          // }}
        /> */}
      </div>
    </div>
  );
};

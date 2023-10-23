import * as React from 'react';
import '../../assets/index.less';
import type { PickerRef } from '../../src/NewPicker/interface';
import RangePicker from '../../src/NewPicker/PickerInput/RangePicker';
import SinglePicker from '../../src/NewPicker/PickerInput/SinglePicker';
import PickerPanel from '../../src/NewPicker/PickerPanel';

import moment from 'moment';
import 'moment/locale/zh-cn';
import momentGenerateConfig from '../../src/generate/moment';
import zhCN from '../../src/locale/zh_CN';

moment.locale('zh-cn');
window.moment = moment;

function CellPicker(props: any) {
  return (
    <div>
      <h5 style={{ margin: 0 }}>{props.picker || 'date'}</h5>
      <PickerPanel locale={zhCN} generateConfig={momentGenerateConfig} {...props} />
    </div>
  );
}

export default () => {
  const singleRef = React.useRef<PickerRef>(null);

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
        <CellPicker
          defaultValue={moment().add(1, 'day')}
          disabledDate={(date) => date.date() === 11}
          // cellRender={(date: Moment, info) => {
          //   if (info.type === 'date') {
          //     return date.format('Do');
          //   }
          // }}
        />

        <CellPicker
          picker="week"
          defaultValue={moment('2000-01-01')}
          disabledDate={(date) => date.week() === 3}
        />
      </div>
    </div>
  );
};

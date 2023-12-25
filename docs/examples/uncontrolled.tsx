import { type Moment } from 'moment';
import React from 'react';
import '../../assets/index.less';
import Picker, { RangePicker } from '../../src';
import momentGenerateConfig from '../../src/generate/moment';
import zhCN from '../../src/locale/zh_CN';

export default () => (
  <div>
    <div style={{ margin: '0 8px' }}>
      <h3>Uncontrolled</h3>
      <Picker<Moment>
        generateConfig={momentGenerateConfig}
        locale={zhCN}
        picker="week"
        allowClear
        onOpenChange={(open) => {
          console.log('1 =>', open);
        }}
      />
      <Picker<Moment>
        generateConfig={momentGenerateConfig}
        locale={zhCN}
        picker="week"
        allowClear
        open
        onOpenChange={(open) => {
          console.log('2 =>', open);
        }}
      />
      <RangePicker<Moment>
        generateConfig={momentGenerateConfig}
        locale={zhCN}
        picker="week"
        allowClear
        // open
        onOpenChange={(open) => {
          console.log('3 =>', open);
        }}
      />
      <button type="button">233</button>
    </div>
  </div>
);

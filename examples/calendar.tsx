import React from 'react';
import { Moment } from 'moment';
import Picker from '../src/Picker';
import PickerPanel from '../src/PickerPanel';
import momentGenerateConfig from '../src/generate/moment';
import zhCN from '../src/locale/zh_CN';
import '../assets/index.less';

function dateRender(date: Moment) {
  return <div style={{ width: 80, height: 80 }}>{date.date()}</div>;
}

export default () => (
  <div>
    <PickerPanel<Moment>
      locale={zhCN}
      generateConfig={momentGenerateConfig}
      dateRender={dateRender}
    />

    <br />

    <Picker<Moment>
      locale={zhCN}
      generateConfig={momentGenerateConfig}
      dateRender={dateRender}
    />
  </div>
);

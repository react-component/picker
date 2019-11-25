import React from 'react';
import moment, { Moment } from 'moment';
import PickerPanel from '../src/PickerPanel';
import momentGenerateConfig from '../src/generate/moment';
import zhCN from '../src/locale/zh_CN';
import '../assets/index.less';

export default () => (
    <div>
      <PickerPanel locale={zhCN} generateConfig={momentGenerateConfig} />
    </div>
  );

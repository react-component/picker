import React from 'react';
import moment, { Moment } from 'moment';
import Picker from '../src/Picker';
import RangePicker from '../src/RangePicker';
import momentGenerateConfig from '../src/generate/moment';
import zhCN from '../src/locale/zh_CN';
import '../assets/index.less';
import './common.less';

const defaultStartValue = moment('2019-09-03 05:02:03');
const defaultEndValue = moment('2019-11-28 01:02:03');
const defaultValue: [Moment, Moment] = [defaultStartValue, defaultEndValue];

export default () => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      <div>
        <h3>Picker</h3>
        <Picker<Moment>
          open
          generateConfig={momentGenerateConfig}
          locale={zhCN}
          allowClear
          defaultValue={defaultStartValue}
          panelRender={node => (
            <>
              <h3>My Panel</h3>
              {node}
            </>
          )}
        />
      </div>
      <div>
        <h3>RangePicker</h3>
        <RangePicker<Moment>
          generateConfig={momentGenerateConfig}
          locale={zhCN}
          allowClear
          defaultValue={defaultValue}
          panelRender={node => (
            <>
              <h3>My Panel</h3>
              {node}
            </>
          )}
        />
      </div>
    </div>
  );
};

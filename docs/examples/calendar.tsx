import React from 'react';
import { Moment } from 'moment';
import Picker from 'rc-picker';
import PickerPanel from '../../src/PickerPanel';
import momentGenerateConfig from '../../src/generate/moment';
import zhCN from '../../src/locale/zh_CN';
import '../../assets/index.less';
import './calendar.less';

function dateRender(date: Moment, today: Moment) {
  return (
    <div
      style={{
        width: 80,
        height: 80,
        borderTop: '3px solid #CCC',
        borderTopColor: date.isSame(today, 'date') ? 'blue' : '#CCC',
      }}
    >
      {date.date()}
    </div>
  );
}

const disabledProps = {
  disabledDate: (date) => date.date() === 10,
  onSelect: (d) => console.log('Select:', d.format('YYYY-MM-DD')),
  onChange: (d) => console.log('Change:', d.format('YYYY-MM-DD')),
};

export default () => (
  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
    <div>
      <PickerPanel<Moment>
        locale={zhCN}
        // picker="month"
        generateConfig={momentGenerateConfig}
        dateRender={dateRender}
        {...disabledProps}
      />
    </div>
    <div>
      <Picker<Moment>
        locale={zhCN}
        generateConfig={momentGenerateConfig}
        dateRender={dateRender}
        {...disabledProps}
      />
    </div>
  </div>
);

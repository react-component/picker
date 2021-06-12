import React from 'react';
import type { Moment } from 'moment';
import moment from 'moment';
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
  const [customizeNode, setCustomizeNode] = React.useState(false);

  return (
    <>
      {String(customizeNode)}
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div>
          <h3>Picker</h3>
          <Picker<Moment>
            generateConfig={momentGenerateConfig}
            locale={zhCN}
            allowClear
            defaultValue={defaultStartValue}
            panelRender={(node) => (
              <>
                <button
                  type="button"
                  style={{ display: 'block' }}
                  onClick={() => {
                    setCustomizeNode(!customizeNode);
                  }}
                >
                  Change
                </button>

                {customizeNode ? <span>My Panel</span> : node}
              </>
            )}
          />
        </div>
        <div>
          <h3>RangePicker - Date</h3>
          <RangePicker<Moment>
            generateConfig={momentGenerateConfig}
            locale={zhCN}
            allowClear
            defaultValue={defaultValue}
            panelRender={(node) => <>{customizeNode ? <span>My Panel</span> : node}</>}
          />
        </div>
        <div>
          <h3>RangePicker - Time</h3>
          <RangePicker<Moment>
            generateConfig={momentGenerateConfig}
            locale={zhCN}
            allowClear
            defaultValue={defaultValue}
            picker="time"
          />
        </div>
      </div>
    </>
  );
};

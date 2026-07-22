import * as React from 'react';
import '../../assets/index.less';
import RangePicker from '../../src/PickerInput/RangePicker';

import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import dayjsGenerateConfig from '../../src/generate/dayjs';
import zhCN from '../../src/locale/zh_CN';

dayjs.locale('zh-cn');

export default () => {
  const [changeCount, setChangeCount] = React.useState(0);

  return (
    <div>
      <input defaultValue="2000-01-01" />

      <h3>Issue #57728: showTime with allowEmpty</h3>
      <p>
        Select a start date without confirming, switch to the end field, switch back to the start
        field, then click the input above. Both fields should reset and the change count should stay
        at 0.
      </p>
      <div>Change count: {changeCount}</div>

      <RangePicker
        locale={zhCN}
        generateConfig={dayjsGenerateConfig}
        style={{ width: 400 }}
        showTime
        allowEmpty
        onChange={() => {
          setChangeCount((count) => count + 1);
        }}
      />
    </div>
  );
};

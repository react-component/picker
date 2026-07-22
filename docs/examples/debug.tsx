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

      <h3>Reset unconfirmed end after switching back</h3>
      <p>
        Select and confirm a start date. Select an end date without confirming, switch back to the
        start field, then click the input above. Switching back should reset the unconfirmed end and
        should not submit the range. The following blur should also keep the change count at 0.
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

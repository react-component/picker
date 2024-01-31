import * as React from 'react';
import '../../assets/index.less';
import SinglePicker from '../../src/PickerInput/SinglePicker';

import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/zh-cn';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import dayjsGenerateConfig from '../../src/generate/dayjs';
import zhCN from '../../src/locale/zh_CN';

dayjs.locale('zh-cn');
dayjs.extend(LocalizedFormat);

console.clear();

(window as any).dayjs = dayjs;

const sharedLocale = {
  locale: zhCN,
  generateConfig: dayjsGenerateConfig,
  style: { width: 300 },
};

export default () => {
  return (
    <div>
      <SinglePicker
        {...sharedLocale}
        // defaultPickerValue={dayjs('2019-09-15')}
        defaultValue={dayjs('2020-09-03')}
        minDate={dayjs('2019-08-01')}
        maxDate={dayjs('2020-10-31')}
        // open
      />
      <SinglePicker
        {...sharedLocale}
        defaultValue={dayjs('2020-09-03')}
        minDate={dayjs('2019-08-01')}
        maxDate={dayjs('2020-10-31')}
        picker="month"
      />
      <SinglePicker
        {...sharedLocale}
        defaultValue={dayjs('2020-09-03')}
        minDate={dayjs('2019-08-01')}
        maxDate={dayjs('2020-10-31')}
        picker="quarter"
      />
    </div>
  );
};

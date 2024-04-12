import * as React from 'react';
import '../../assets/index.less';
import type { Locale } from '../../src/interface';
import RangePicker from '../../src/PickerInput/RangePicker';
import SinglePicker from '../../src/PickerInput/SinglePicker';
import PickerPanel from '../../src/PickerPanel';

import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/zh-cn';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import dayjsGenerateConfig from '../../src/generate/dayjs';
import zhCN from '../../src/locale/zh_CN';

dayjs.locale('zh-cn');
// dayjs.locale('ar');
dayjs.extend(buddhistEra);
dayjs.extend(LocalizedFormat);

console.clear();

(window as any).dayjs = dayjs;

const myLocale: Locale = {
  ...zhCN,
  // cellQuarterFormat: '第Q季度',
  // fieldYearFormat: 'BBBB',
  // cellYearFormat: 'BBBB',
  // yearFormat: 'BBBB',
  // cellDateFormat: '!d!',
};

const sharedLocale = {
  locale: myLocale,
  generateConfig: dayjsGenerateConfig,
};

export default () => {
  return (
    <div>
      {/* <RangePicker {...sharedLocale} style={{ width: 400 }} showTime />
      <RangePicker {...sharedLocale} style={{ width: 400 }} showTime showMinute={false} /> */}
      <SinglePicker
        {...sharedLocale}
        style={{ width: 400 }}
        showTime
        showHour
        showMinute
        // showSecond={false}
      />
    </div>
  );
};

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
import dateFnsGenerateConfig from '../../src/generate/dateFns';
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

const dateFnsSharedLocale = {
  locale: myLocale,
  generateConfig: dateFnsGenerateConfig,
};

export default () => {
  return (
    <div>
      <input defaultValue="2000-01-01" />
      {/* <RangePicker
        {...sharedLocale}
        style={{ width: 400 }}
        onChange={(val) => console.error('>>>>>>>', val)}
      /> */}
      <RangePicker
        {...sharedLocale}
        style={{ width: 400 }}
        showTime
        // allowEmpty
        // disabledDate={(_, info) => {
        //   console.log('Date:', info);
        //   return false;
        // }}
        // disabledTime={(date, range, info) => {
        //   // console.log(`Time-${range}`, range, info);
        //   const { from } = info;

        //   if (from) {
        //     console.log(
        //       `Time-${range}`,
        //       from.format('YYYY-MM-DD HH:mm:ss'),
        //       date.format('YYYY-MM-DD HH:mm:ss'),
        //     );
        //   }

        //   if (from && from.isSame(date, 'day')) {
        //     return {
        //       disabledHours: () => [from.hour()],
        //       disabledMinutes: () => [0, 1, 2, 3],
        //       disabledSeconds: () => [0, 1, 2, 3],
        //     };
        //   }
        //   return {};
        // }}
      />

      <RangePicker
        {...sharedLocale}
        style={{ width: 400 }}
        minDate={dayjs('2024')}
        open
        mode={['year', 'year']}
      />
      {/* <SinglePicker
        {...dateFnsSharedLocale}
        style={{ width: 400 }}
        showTime
        disabledTime={(...args) => {
          console.log('Time Single:', ...args);
          return {};
        }}
      /> */}
      {/* <SinglePicker
        {...sharedLocale}
        style={{ width: 400 }}
        minDate={dayjs()}
        onChange={(val) => console.error('>>>>>>>', val)}
      /> */}
    </div>
  );
};

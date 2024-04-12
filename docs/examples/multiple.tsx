import * as React from 'react';
import '../../assets/index.less';
import type { PickerRef } from '../../src/interface';
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
  const singleRef = React.useRef<PickerRef>(null);

  return (
    <div>
      <SinglePicker {...sharedLocale} multiple ref={singleRef} onOpenChange={console.error} />
      <SinglePicker {...sharedLocale} multiple ref={singleRef} needConfirm />
      <SinglePicker {...sharedLocale} multiple picker="week" defaultValue={[
        dayjs('2021-01-01'),
        dayjs('2021-01-08'),
      ]} />
    </div>
  );
};

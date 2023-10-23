import * as React from 'react';
import '../../assets/index.less';
import type { PickerRef } from '../../src/NewPicker/interface';
import RangePicker from '../../src/NewPicker/PickerInput/RangePicker';
import SinglePicker from '../../src/NewPicker/PickerInput/SinglePicker';
import PickerPanel from '../../src/NewPicker/PickerPanel';

import moment from 'moment';
import 'moment/locale/zh-cn';
import momentGenerateConfig from '../../src/generate/moment';
import zhCN from '../../src/locale/zh_CN';

moment.locale('zh-cn');
window.moment = moment;

export default () => {
  const singleRef = React.useRef<PickerRef>(null);

  return (
    <div>
      <SinglePicker ref={singleRef} suffixIcon="🧶" />
      <br />
      <RangePicker suffixIcon="🧶" />
      <br />

      <button
        onClick={() => {
          singleRef.current?.focus();
        }}
      >
        Focus
      </button>

      <PickerPanel
        defaultValue={moment().add(1, 'day')}
        locale={zhCN}
        generateConfig={momentGenerateConfig}
        disabledDate={(date) => date.date() === 11}
      />
    </div>
  );
};

import type { Moment } from 'moment';
import moment from 'moment';
import 'moment/locale/zh-cn';
import React from 'react';
import '../../assets/index.less';
import Picker from '../../src';
import momentGenerateConfig from '../../src/generate/moment';
import enUS from '../../src/locale/en_US';
import zhCN from '../../src/locale/zh_CN';

// const defaultValue = moment('2019-09-03 05:02:03');
const defaultValue = moment('2019-11-28 01:02:03');

export default () => {
  const [locale, setLocale] = React.useState(enUS);
  const [value, setValue] = React.useState<Moment | null>(defaultValue);

  const onChange = (newValue: Moment | null, formatString?: string) => {
    console.log('Change:', newValue, formatString);
    setValue(newValue);
  };

  const sharedProps = {
    generateConfig: momentGenerateConfig,
    value,
    onChange,
    presets: [
      {
        label: 'Hello World!',
        value: moment(),
      },
      {
        label: 'Now',
        value: () => moment(),
      },
    ],
  };

  return (
    <div>
      <Picker<Moment> {...sharedProps} locale={locale} format="dddd" />
      <button
        onClick={() =>
          setLocale((l) => {
            const next = l === zhCN ? enUS : zhCN;
            moment.locale(next.locale === 'zh-cn' ? 'zh-cn' : 'en');

            return next;
          })
        }
      >
        {locale.locale}
      </button>
    </div>
  );
};

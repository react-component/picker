import React from 'react';
import moment, { Moment } from 'moment';
import RangePicker from '../src/RangePicker';
import momentGenerateConfig from '../src/generate/moment';
import zhCN from '../src/locale/zh_CN';
import '../assets/index.less';

const defaultStartValue = moment('2019-09-03 05:02:03');
const defaultEndValue = moment('2019-11-28 01:02:03');

function formatDate(date: Moment | null) {
  return date ? date.format('YYYY-MM-DD HH:mm:ss') : 'null';
}

export default () => {
  const [value, setValue] = React.useState<
    [Moment | null, Moment | null] | null
  >([defaultStartValue, defaultEndValue]);

  const onChange = (
    newValue: [Moment | null, Moment | null] | null,
    formatStrings?: string[],
  ) => {
    console.log('Change:', newValue, formatStrings);
    setValue(newValue);
  };

  const sharedProps = {
    generateConfig: momentGenerateConfig,
    value,
    onChange,
  };

  return (
    <div>
      <h1>
        Value:{' '}
        {value ? `${formatDate(value[0])} ~ ${formatDate(value[1])}` : 'null'}
      </h1>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ margin: '0 8px' }}>
          <h3>Basic</h3>
          <RangePicker<Moment> {...sharedProps} locale={zhCN} />
        </div>

        <div style={{ margin: '0 8px' }}>
          <h3>Uncontrolled</h3>
          <RangePicker<Moment>
            {...sharedProps}
            value={undefined}
            locale={zhCN}
            placeholder={['start...', 'end...']}
            showTime={{
              hideDisabledOptions: true,
            }}
            disabledTime={(date, type) => {
              if (type === 'start') {
                return {
                  disabledHours: () => [1, 2, 3, 4, 5, 6, 7],
                };
              }
              return {};
            }}
            defaultPickerValue={[defaultEndValue, defaultStartValue]}
          />
        </div>
      </div>
    </div>
  );
};

import moment, { type Moment } from 'moment';
import React from 'react';
import '../../assets/index.less';
import { PickerPanel } from '../../src';
import momentGenerateConfig from '../../src/generate/moment';
import enUS from '../../src/locale/en_US';
import jaJP from '../../src/locale/ja_JP';
import zhCN from '../../src/locale/zh_CN';

// const defaultValue = moment('2019-09-03 05:02:03');
const defaultValue = moment('2019-11-28 01:02:03');

export default () => {
  const [value, setValue] = React.useState<Moment | null>(defaultValue);

  const onSelect = (newValue: Moment) => {
    console.log('Select:', newValue);
  };

  const onChange = (newValue: Moment | null, formatString?: string) => {
    console.log('Change:', newValue, formatString);
    setValue(newValue);
  };

  const sharedProps = {
    generateConfig: momentGenerateConfig,
    value,
    onSelect,
    onChange,
  };

  return (
    <div>
      <h1>Value: {value ? value.format('YYYY-MM-DD HH:mm:ss') : 'null'}</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ margin: '0 8px' }}>
          <h3>Basic</h3>
          <PickerPanel<Moment> {...sharedProps} locale={zhCN} />
        </div>

        <div style={{ margin: '0 8px' }}>
          <h3>Uncontrolled</h3>
          <PickerPanel<Moment>
            generateConfig={momentGenerateConfig}
            locale={zhCN}
            onChange={onChange}
            defaultValue={moment('2000-01-01', 'YYYY-MM-DD')}
          />
        </div>

        <div style={{ margin: '0 8px' }}>
          <h3>1 Month earlier</h3>
          <PickerPanel<Moment>
            {...sharedProps}
            defaultPickerValue={defaultValue.clone().subtract(1, 'month')}
            locale={enUS}
          />
        </div>

        <div style={{ margin: '0 8px' }}>
          <h3>Week Picker CN</h3>
          <PickerPanel<Moment> {...sharedProps} locale={zhCN} picker="week" />
        </div>

        <div style={{ margin: '0 8px' }}>
          <h3>Month Picker</h3>
          <PickerPanel<Moment> {...sharedProps} locale={zhCN} picker="month" />
        </div>

        <div style={{ margin: '0 8px' }}>
          <h3>Quarter Picker</h3>
          <PickerPanel<Moment> {...sharedProps} locale={zhCN} picker="quarter" />
        </div>

        <div style={{ margin: '0 8px' }}>
          <h3>Week Picker US</h3>
          <PickerPanel<Moment> {...sharedProps} locale={enUS} picker="week" />
        </div>

        <div style={{ margin: '0 8px' }}>
          <h3>Time</h3>
          <PickerPanel<Moment> {...sharedProps} locale={jaJP} picker="time" />
        </div>
        <div style={{ margin: '0 8px' }}>
          <h3>Uncontrolled</h3>
          <PickerPanel<Moment> {...sharedProps} locale={jaJP} value={undefined} picker="time" />
        </div>
        <div style={{ margin: '0 8px' }}>
          <h3>Time AM/PM</h3>
          <PickerPanel<Moment>
            {...sharedProps}
            locale={jaJP}
            picker="time"
            showTime={{
              use12Hours: true,
              showSecond: false,
              format: 'hh:mm A',
            }}
          />
        </div>
        <div style={{ margin: '0 8px' }}>
          <h3>Datetime</h3>
          <PickerPanel<Moment> {...sharedProps} locale={zhCN} showTime />
        </div>
      </div>
    </div>
  );
};

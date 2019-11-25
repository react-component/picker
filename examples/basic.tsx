import React from 'react';
import moment, { Moment } from 'moment';
import Picker from '../src/Picker';
import PickerPanel from '../src/PickerPanel';
import momentGenerateConfig from '../src/generate/moment';
import zhCN from '../src/locale/zh_CN';
import enUS from '../src/locale/en_US';
import jaJP from '../src/locale/ja_JP';
import '../assets/index.less';
import { PanelMode } from '../src/interface';

// const defaultValue = moment('2019-09-03 05:02:03');
const defaultValue = moment('2019-11-28 01:02:03');

const getMonthNextMode = (next: PanelMode): PanelMode => {
  if (next === 'date') {
    return 'month';
  }
  return next;
};

const getWeekNextMode = (next: PanelMode): PanelMode => {
  if (next === 'date') {
    return 'week';
  }
  return next;
};

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
          <h3>1 Month earlier</h3>
          <PickerPanel<Moment>
            {...sharedProps}
            defaultPickerValue={defaultValue.clone().subtract(1, 'month')}
            locale={enUS}
          />
        </div>

        <div style={{ margin: '0 8px' }}>
          <h3>Week Picker CN</h3>
          <PickerPanel<Moment>
            {...sharedProps}
            locale={zhCN}
            getNextMode={getWeekNextMode}
          />
        </div>

        <div style={{ margin: '0 8px' }}>
          <h3>Month Picker</h3>
          <PickerPanel<Moment>
            {...sharedProps}
            locale={zhCN}
            getNextMode={getMonthNextMode}
          />
        </div>

        <div style={{ margin: '0 8px' }}>
          <h3>Week Picker US</h3>
          <PickerPanel<Moment>
            {...sharedProps}
            locale={enUS}
            getNextMode={getWeekNextMode}
          />
        </div>

        <div style={{ margin: '0 8px' }}>
          <h3>Time</h3>
          <PickerPanel<Moment> {...sharedProps} locale={jaJP} mode="time" />
        </div>
        <div style={{ margin: '0 8px' }}>
          <h3>Time AM/PM</h3>
          <PickerPanel<Moment>
            {...sharedProps}
            locale={jaJP}
            mode="time"
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

      <div style={{ display: 'flex' }}>
        <div style={{ margin: '0 8px' }}>
          <h3>Basic</h3>
          <Picker<Moment> {...sharedProps} locale={zhCN} />
        </div>
        <div style={{ margin: '0 8px' }}>
          <h3>Datetime</h3>
          <Picker<Moment>
            {...sharedProps}
            locale={zhCN}
            defaultPickerValue={defaultValue.clone().subtract(1, 'month')}
            showTime
            disabledTime={date => {
              if (date && date.isSame(defaultValue, 'date')) {
                return {
                  disabledHours: () => [1, 3, 5, 7, 9, 11],
                };
              }
              return {};
            }}
          />
        </div>
        <div style={{ margin: '0 8px' }}>
          <h3>Week</h3>
          <Picker<Moment>
            {...sharedProps}
            locale={zhCN}
            format="YYYY-Wo"
            allowClear
            getNextMode={getWeekNextMode}
          />
        </div>
      </div>
    </div>
  );
};

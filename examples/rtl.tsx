import React from 'react';
import moment, { Moment } from 'moment';
import Picker from '../src/Picker';
import RangePicker from '../src/RangePicker';
import PickerPanel from '../src/PickerPanel';
import momentGenerateConfig from '../src/generate/moment';
import zhCN from '../src/locale/zh_CN';
import enUS from '../src/locale/en_US';
import jaJP from '../src/locale/ja_JP';
import '../assets/index.less';

const defaultValue = moment('2019-11-28 01:02:03');

function formatDate(date: Moment | null) {
  return date ? date.format('YYYY-MM-DD HH:mm:ss') : 'null';
}

export default () => {
  const [value, setValue] = React.useState<Moment | null>(defaultValue);

  const weekRef = React.useRef<Picker<Moment>>(null);

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
    direction: 'rtl',
  };

  const rangePickerRef = React.useRef<RangePicker<Moment>>(null);

  return (
    <div dir="rtl">
      <h2>
        Value:{' '}
        {value ? `${formatDate(value[0])} ~ ${formatDate(value[1])}` : 'null'}
      </h2>

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
          <h3>Week Picker US</h3>
          <PickerPanel<Moment> {...sharedProps} locale={enUS} picker="week" />
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
          <h3>Uncontrolled</h3>
          <Picker<Moment>
            generateConfig={momentGenerateConfig}
            locale={zhCN}
            allowClear
          />
        </div>
        <div style={{ margin: '0 8px' }}>
          <h3>Datetime</h3>
          <Picker<Moment>
            {...sharedProps}
            locale={zhCN}
            defaultPickerValue={defaultValue.clone().subtract(1, 'month')}
            showTime={{
              showSecond: false,
              defaultValue: moment('11:28:39', 'HH:mm:ss'),
            }}
            showToday
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
          <h3>Uncontrolled Datetime</h3>
          <Picker<Moment> generateConfig={momentGenerateConfig} locale={zhCN} />
        </div>
        <div style={{ margin: '0 8px' }}>
          <h3>Week</h3>
          <Picker<Moment>
            {...sharedProps}
            locale={zhCN}
            format="gggg-Wo"
            allowClear
            picker="week"
            renderExtraFooter={() => 'I am footer!!!'}
            ref={weekRef}
          />

          <button
            type="button"
            onClick={() => {
              if (weekRef.current) {
                weekRef.current.focus();
              }
            }}
          >
            Focus
          </button>
        </div>
        <div style={{ margin: '0 8px' }}>
          <h3>Week</h3>
          <Picker<Moment>
            generateConfig={momentGenerateConfig}
            locale={zhCN}
            picker="week"
          />
        </div>
        <div style={{ margin: '0 8px' }}>
          <h3>Time</h3>
          <Picker<Moment> {...sharedProps} locale={zhCN} picker="time" />
        </div>
        <div style={{ margin: '0 8px' }}>
          <h3>Time 12</h3>
          <Picker<Moment>
            {...sharedProps}
            locale={zhCN}
            picker="time"
            use12Hours
          />
        </div>
        <div style={{ margin: '0 8px' }}>
          <h3>Year</h3>
          <Picker<Moment> {...sharedProps} locale={zhCN} picker="year" />
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ margin: '0 8px' }}>
          <h3>Basic RangePicker</h3>
          <RangePicker<Moment>
            {...sharedProps}
            value={undefined}
            locale={zhCN}
            allowClear
            ref={rangePickerRef}
            defaultValue={[moment('1990-09-03'), moment('1989-11-28')]}
            placeholder={['start...', 'end...']}
          />
        </div>
      </div>
    </div>
  );
};

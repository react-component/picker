import * as React from 'react';
import '../../assets/index.less';
import type { Locale, PickerRef } from '../../src/NewPicker/interface';
import RangePicker from '../../src/NewPicker/PickerInput/RangePicker';
import PickerPanel, { type PickerPanelProps } from '../../src/NewPicker/PickerPanel';

import moment, { type Moment } from 'moment';
import 'moment/locale/zh-cn';
import momentGenerateConfig from '../../src/generate/moment';
import zhCN from '../../src/locale/zh_CN';

moment.locale('zh-cn');
window.moment = moment;

const myLocale: Locale = { ...zhCN, quarterCellFormat: '第Q季度' };

const sharedLocale = {
  locale: myLocale,
  generateConfig: momentGenerateConfig,
};

function CellPicker(props: Partial<PickerPanelProps>) {
  return (
    <div>
      <h5 style={{ margin: 0 }}>{props.picker || 'date'}</h5>
      <PickerPanel {...sharedLocale} {...props} />
    </div>
  );
}

const MyTime = () => <div>2333</div>;

export default () => {
  const singleRef = React.useRef<PickerRef>(null);

  const [value, setValue] = React.useState<Moment>(null);
  const [rangeValue, setRangeValue] = React.useState<[Moment?, Moment?]>(
    // has start
    // [moment('2023-11-15'), null],
    // has end
    // [null, moment('2023-11-15')],
    // [moment('2023-11-5'), moment('2023-12-29')],
    // [moment('2000-09-03'), moment('1990-09-03')],
    null,
  );

  return (
    <div>
      {/* <SinglePicker ref={singleRef} suffixIcon="🧶" /> */}
      <br />
      <RangePicker
        {...sharedLocale}
        // className="good"
        // style={{ opacity: 0.5 }}
        // picker="year"
        // value={[moment('2000-01-01'), null]}
        // presets={[
        //   {
        //     label: 'Now',
        //     value: [moment(), moment()],
        //   },
        //   {
        //     label: 'This Week',
        //     value: [moment().add(-7, 'd'), moment()],
        //   },
        //   {
        //     label: 'Last Week',
        //     value: [moment().add(-14, 'd'), moment().add(-7, 'd')],
        //   },
        //   {
        //     label: 'Wrong Order',
        //     value: [moment(), moment().add(-14, 'd')],
        //   },
        // ]}
        value={rangeValue}
        placeholder={['Start', 'End']}
        // defaultPickerValue={[moment('2020-01-01'), null]}
        // onPickerValueChange={(dates, info) => {
        //   console.log('🍭 Picker Value Change:', dates, info);
        // }}
        // disabled={[true, false]}
        suffixIcon="🧶"
        disabledDate={(date) => date.date() === 11}
        // onFocus={() => {
        //   console.log('🍷 Focus!');
        // }}
        // onBlur={() => {
        //   console.log('🍷 Blur!');
        // }}
        // changeOnBlur
        // format={{
        //   format: 'YYYY-MM-DD',
        //   // format: 'YYYY-MM-DD HH:mm:ss.SSS',
        //   //   // format: 'YYYYMMDD',
        //   // align: true,
        // }}
        preserveInvalidOnBlur
        showTime={{
          defaultValue: [moment('2000-01-01 01:03:05'), moment('2000-01-01 03:07:22')],
        }}
        onChange={(val, text) => {
          console.log('🔥 Change:', val, text);
          setRangeValue(val);
        }}
        // onCalendarChange={(val, text, info) => {
        //   console.log('🎉 Calendar Change:', val, text, info);
        // }}
        // preserveInvalidOnBlur
        allowEmpty={[false, true]}
        // onOpenChange={(nextOpen) => {
        //   console.log('🏆 Next Open:', nextOpen);
        // }}
        // mode={['month', 'year']}
        // onPanelChange={(val, mode) => {
        //   console.log('🏆 Panel Change:', val?.[0]?.format('YYYY-MM-DD'), mode);
        // }}
        // onPickerValueChange={(val) => {
        //   console.log('👻 Picker Value Change:', val);
        // }}
        // open
        // renderExtraFooter={(mode) => mode}
        components={
          {
            // datetime: () => null,
          }
        }
      />
      <br />

      <button
        onClick={() => {
          singleRef.current?.focus();
        }}
      >
        Focus
      </button>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {/* <CellPicker
          picker="time"
          // components={{
          //   time: MyTime,
          // }}
          showTime={{
            format: 'HH:mm:ss.SSS',
            showTitle: true,
            // defaultValue: moment('2000-01-01 01:03:05.800'),
          }}
          pickerValue={moment('2000-01-01 01:03:05.800')}
        /> */}
        {/* <CellPicker
          picker="date"
          // showTime={{
          //   format: 'HH:mm:ss.SSS A',
          //   showTitle: true,
          // }}
        /> */}
        {/* <CellPicker
          picker="week"
        /> */}

        {/* <CellPicker
          defaultValue={moment().add(1, 'day')}
          disabledDate={(date) => date.date() === 11}
          // cellRender={(date: Moment, info) => {
          //   if (info.type === 'date') {
          //     return date.format('Do');
          //   }
          // }}
          value={value}
          onChange={setValue}
        />

        <CellPicker
          picker="week"
          defaultValue={moment('2000-01-01')}
          disabledDate={(date) => date.week() === 3}
        />

        <CellPicker
          picker="month"
          defaultValue={moment('2000-01-01')}
          disabledDate={(date) => date.week() === 3}
          value={value}
          onChange={setValue}
        />

        <CellPicker
          picker="year"
          defaultValue={moment('2023-04-05')}
          disabledDate={(date) => date.week() === 3}
        />

        <CellPicker
          picker="decade"
          defaultValue={moment('2023-04-05')}
          disabledDate={(date) => date.week() === 3}
        />

        <CellPicker
          picker="time"
          defaultValue={moment('1990-10-23 13:05:08.200')}
          disabledDate={(date) => date.week() === 3}
          showTime={{
            format: 'HH:mm:ss.SSS',
            // format: 'LTS',
            use12Hours: true,
            changeOnScroll: true,
            disabledHours: () => [0, 1, 2, 3, 4, 5],
            disabledMinutes: (hour) => (hour === 6 ? [0, 1, 2, 4, 5, 6] : []),
            disabledSeconds: (_, minute) => (minute === 3 ? [6, 7, 8, 9] : []),
            disabledTime: () => ({
              disabledMilliSeconds: () => [0, 100],
            }),
            showTitle: true,
            millisecondStep: 20,
          }}
          // cellRender={(val: number, info) => {
          //   if (info.type === 'time') {
          //     return `${val}!!!`;
          //   }
          // }}
        /> */}
      </div>
    </div>
  );
};

import * as React from 'react';
import '../../assets/index.less';
import type { Locale, PickerRef } from '../../src/NewPicker/interface';
import RangePicker from '../../src/NewPicker/PickerInput/RangePicker';
import PickerPanel, { type PickerPanelProps } from '../../src/NewPicker/PickerPanel';

import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/zh-cn';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import dayjsGenerateConfig from '../../src/generate/dayjs';
import zhCN from '../../src/locale/zh_CN';
import TimePanel from '../../src/NewPicker/PickerPanel/TimePanel';

dayjs.locale('zh-cn');
// dayjs.locale('ar');
dayjs.extend(buddhistEra);
dayjs.extend(LocalizedFormat);

// console.log('>>', dayjs().format('YYYY-MM-dd'));

(window as any).dayjs = dayjs;

const myLocale: Locale = {
  ...zhCN,
  cellQuarterFormat: '第Q季度',
  // fieldYearFormat: 'BBBB',
  // cellYearFormat: 'BBBB',
  // yearFormat: 'BBBB',
  // cellDateFormat: '!d!',
};

const sharedLocale = {
  locale: myLocale,
  generateConfig: dayjsGenerateConfig,
};

function CellPicker(props: Partial<PickerPanelProps>) {
  return (
    <div>
      <h5 style={{ margin: 0 }}>{props.picker || 'date'}</h5>
      <PickerPanel {...sharedLocale} {...props} />
    </div>
  );
}

const MyTime = (props: any) => {
  return (
    <div>
      2333
      <TimePanel {...props} />
    </div>
  );
};

export default () => {
  const singleRef = React.useRef<PickerRef>(null);

  const [value, setValue] = React.useState<Dayjs>(null);
  const [rangeValue, setRangeValue] = React.useState<[Dayjs?, Dayjs?]>(
    // has start
    // [dayjs('2023-11-15'), null],
    // has end
    // [null, dayjs('2023-11-15')],
    // [dayjs('2020-03-30'), dayjs('2020-05-20')],
    // [dayjs('2000-09-03'), dayjs('1990-09-03')],
    // [dayjs('1990-09-03'), null],
    // null,
    undefined,
  );

  return (
    <div>
      <input defaultValue="00:01:00" />

      {/* <SinglePicker ref={singleRef} suffixIcon="🧶" /> */}
      <br />
      <RangePicker
        {...sharedLocale}
        showWeek
        value={rangeValue}
        // open
        placeholder={['Start', 'End']}
        suffixIcon="🧶"
        onFocus={(_, info) => {
          console.log('👁️ Focus', info);
        }}
        onBlur={(_, info) => {
          console.log('👁️ Blur', info);
        }}
        onChange={(val, text) => {
          console.log('🔥 Change:', val, text);
          setRangeValue(val);
        }}
        onCalendarChange={(val, text, info) => {
          console.log('🎉 Calendar Change:', val, text, info);
        }}
        onOpenChange={(nextOpen) => {
          console.log('🏆 Next Open:', nextOpen);
        }}
        onPickerValueChange={(val, info) => {
          console.log(
            '👻 Picker Value Change:',
            val,
            val?.[0]?.format('YYYY-MM-DD'),
            val?.[1]?.format('YYYY-MM-DD'),
            info,
          );
        }}
        id={{
          start: 'inputStart',
          end: 'inputEnd',
        }}
        renderExtraFooter={() => <input />}
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
          locale={{
            ...zhCN,
            cellMeridiemFormat: 'A',
          }}
          components={{
            time: MyTime,
          }}
          showTime={{
            format: 'HH:mm:ss',
            use12Hours: true,
            // showTitle: true,
            // defaultValue: dayjs('2000-01-01 01:03:05.800'),
          }}
          pickerValue={dayjs('2000-01-01 01:03:05.800')}
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
          defaultValue={dayjs().add(1, 'day')}
          disabledDate={(date) => date.date() === 11}
          // cellRender={(date: Dayjs, info) => {
          //   if (info.type === 'date') {
          //     return date.format('Do');
          //   }
          // }}
          value={value}
          onChange={setValue}
        />

        <CellPicker
          picker="week"
          defaultValue={dayjs('2000-01-01')}
          disabledDate={(date) => date.week() === 3}
        />

        <CellPicker
          picker="month"
          defaultValue={dayjs('2000-01-01')}
          disabledDate={(date) => date.week() === 3}
          value={value}
          onChange={setValue}
        />

        <CellPicker
          picker="year"
          defaultValue={dayjs('2023-04-05')}
          disabledDate={(date) => date.week() === 3}
        />

        <CellPicker
          picker="decade"
          defaultValue={dayjs('2023-04-05')}
          disabledDate={(date) => date.week() === 3}
        />

        <CellPicker
          picker="time"
          defaultValue={dayjs('1990-10-23 13:05:08.200')}
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

import * as React from 'react';
import '../../assets/index.less';
import type { Locale, PickerRef } from '../../src/NewPicker/interface';
import RangePicker from '../../src/NewPicker/PickerInput/RangePicker';
import SinglePicker from '../../src/NewPicker/PickerInput/SinglePicker';
import PickerPanel from '../../src/NewPicker/PickerPanel';

import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/zh-cn';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import dayjsGenerateConfig from '../../src/generate/dayjs';
import zhCN from '../../src/locale/zh_CN';

dayjs.locale('zh-cn');
// dayjs.locale('ar');
dayjs.extend(buddhistEra);
dayjs.extend(LocalizedFormat);

console.log('>>', RangePicker, SinglePicker, PickerPanel);
console.clear();

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

const MyInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => {
    console.log('>>>', props);
    const { 'data-range': range, value, style } = props as any;

    // return (
    //   <div>
    //     <input {...props} ref={ref} />
    //   </div>
    // );

    return (
      <div style={{ position: 'relative' }}>
        <input
          {...props}
          style={{
            ...style,
            opacity: value ? 1 : 0,
          }}
          ref={ref}
        />
        {!value && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              pointerEvents: 'none',
            }}
          >
            {range === 'start' ? '从未' : '至今'}
          </div>
        )}
      </div>
    );
  },
);
MyInput.displayName = 'MyInput';

export default () => {
  const singleRef = React.useRef<PickerRef>(null);

  const [value, setValue] = React.useState<Dayjs>(null);
  const [rangeValue, setRangeValue] = React.useState<[Dayjs?, Dayjs?]>(
    // [dayjs('2000-12-15'), dayjs('2020-12-22')],
    // null,
    undefined,
  );

  const setSingleValue = (nextVal: Dayjs) => {
    setValue(nextVal);
  };

  return (
    <div>
      <input defaultValue="00:01:00" />

      {/* <SinglePicker ref={singleRef} suffixIcon="🧶" /> */}
      <br />
      <RangePicker
        {...sharedLocale}
        value={rangeValue}
        // components={{
        //   input: MyInput,
        // }}
        // showTime
        panelRender={(ori) => <>2333{ori}</>}
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
        {/* <PickerPanel
          generateConfig={dayjsGenerateConfig}
          locale={zhCN}
          value={value}
          multiple={true as boolean}
          onChange={setSingleValue}
        /> */}
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

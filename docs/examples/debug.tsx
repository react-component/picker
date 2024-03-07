import * as React from 'react';
import '../../assets/index.less';
import type { Locale, PickerRef } from '../../src/interface';
import RangePicker from '../../src/PickerInput/RangePicker';
import SinglePicker from '../../src/PickerInput/SinglePicker';
import PickerPanel from '../../src/PickerPanel';

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

console.log('>>', RangePicker, SinglePicker, PickerPanel, Origin7Range);
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

function Origin7Range() {
  const [dates, setDates] = React.useState<any>(null);
  const [value, setValue] = React.useState<any>(null);

  const disabledDate = (current: Dayjs) => {
    if (!dates) {
      return false;
    }

    const tooLate = dates[0] && current.diff(dates[0], 'days') >= 7;
    const tooEarly = dates[1] && dates[1].diff(current, 'days') >= 7;

    console.log(
      '>>>',
      current?.format('YYYY-MM-DD'),
      dates[0]?.format('YYYY-MM-DD'),
      dates[1]?.format('YYYY-MM-DD'),
      tooEarly,
      tooLate,
    );

    return !!tooEarly || !!tooLate;
  };

  const onOpenChange = (open: boolean) => {
    if (open) {
      setDates([null, null]);
    } else {
      setDates(null);
    }
  };

  return (
    <RangePicker
      {...sharedLocale}
      value={dates || value}
      disabledDate={disabledDate}
      onCalendarChange={(val) => {
        setDates(val);
      }}
      onChange={(val) => {
        setValue(val);
      }}
      onOpenChange={onOpenChange}
      changeOnBlur
    />
  );
}

const MyInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => {
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

const App: React.FC = () => {
  const [value, setValue] = React.useState<[Dayjs | null, Dayjs | null]>([
    dayjs().subtract(60, 'days').startOf('day'),
    dayjs().endOf('day'),
  ]);
  return (
    <RangePicker {...sharedLocale} showTime value={value} onChange={setValue} onOk={setValue} />
  );
};

export default App;

// export default () => {
//   const [value, setValue] = React.useState<Dayjs>(dayjs('2024-01-15'));
//   const setSingleValue = (nextVal: Dayjs) => {
//     setValue(nextVal);
//   };

//   React.useEffect(() => {
//     setTimeout(() => {
//       setValue(dayjs('2024-03-03'));
//     }, 2000);
//   }, []);

//   return (
//     <div>
//       <RangePicker {...sharedLocale} open picker="time" style={{ width: 400 }} />

//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
//         <PickerPanel
//           generateConfig={dayjsGenerateConfig}
//           locale={zhCN}
//           value={value}
//           onChange={setSingleValue}
//           onPanelChange={(panelValue, mode) => {
//             console.error('1');
//             console.log('🎲 PanelValue Change:', panelValue, mode);
//           }}
//         />
//       </div>
//     </div>
//   );
// };

import React from 'react';
import moment, { Moment } from 'moment';
import Picker from '../src/Picker';
import PickerPanel from '../src/PickerPanel';
import { GenerateConfig } from '../src/utils/generateUtil';
import zhCN from '../src/locale/zh_CN';
import enUS from '../src/locale/en_US';
import jaJP from '../src/locale/ja_JP';
import '../assets/index.less';

const defaultValue = moment('2019-09-03 05:02:03');
// const defaultValue = moment('2019-11-28 01:02:03');

const generateConfig: GenerateConfig<Moment> = {
  // get
  getFirstDateOfMonth: date => {
    const clone = date.clone();
    clone.date(1);
    return clone;
  },
  getLastDateOfMonth: date => {
    const clone = date.clone();
    clone
      .date(1)
      .add(1, 'month')
      .subtract(1, 'day');
    return clone;
  },
  getNow: () => moment(),
  getWeekDay: date => date.weekday(),
  getYear: date => date.year(),
  getMonth: date => date.month(),
  getDate: date => date.date(),
  getHour: date => date.hour(),
  getMinute: date => date.minute(),
  getSecond: date => date.second(),

  // set
  addYear: (date, diff) => {
    const clone = date.clone();
    clone.add(diff, 'year');
    return clone;
  },
  addMonth: (date, diff) => {
    const clone = date.clone();
    clone.add(diff, 'month');
    return clone;
  },
  addDate: (date, diff) => {
    const clone = date.clone();
    clone.add(diff, 'day');
    return clone;
  },
  setYear: (date, year) => {
    const clone = date.clone();
    clone.year(year);
    return clone;
  },
  setMonth: (date, month) => {
    const clone = date.clone();
    clone.month(month);
    return clone;
  },
  setHour: (date, hour) => {
    const clone = date.clone();
    clone.hour(hour);
    return clone;
  },
  setMinute: (date, minute) => {
    const clone = date.clone();
    clone.minute(minute);
    return clone;
  },
  setSecond: (date, second) => {
    const clone = date.clone();
    clone.second(second);
    return clone;
  },

  locale: {
    getWeekFirstDay: locale => {
      const date = moment().locale(locale);
      return date.localeData().firstDayOfWeek();
    },
    getShortWeekDays: locale => {
      const date = moment().locale(locale);
      return date.localeData().weekdaysMin();
    },
    getShortMonths: locale => {
      const date = moment().locale(locale);
      return date.localeData().monthsShort();
    },
    format: (locale, date, format) => {
      const clone = date.clone();
      clone.locale(locale);
      return clone.format(format);
    },
    parse: (locale, text, formats) => {
      for (let i = 0; i < formats.length; i += 1) {
        const date = moment(text, formats[i], locale, true);
        if (date.isValid()) {
          return date;
        }
      }
      return null;
    },
  },
};

export default () => {
  const [value, setValue] = React.useState(defaultValue);

  const onSelect = (newValue: Moment) => {
    console.log('Select:', newValue);
  };

  const onChange = (newValue: Moment) => {
    console.log('Change:', newValue);
    setValue(newValue);
  };

  const sharedProps = {
    generateConfig,
    value,
    onSelect,
    onChange,
  };

  return (
    <div>
      <h1>Value: {value.format('YYYY-MM-DD HH:mm:ss')}</h1>

      <div style={{ display: 'flex' }}>
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
      </div>
    </div>
  );
};

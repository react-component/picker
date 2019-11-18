import React from 'react';
import moment, { Moment } from 'moment';
import Picker from '../src/Picker';
import { GenerateConfig } from '../src/utils/generateUtil';
import zhCN from '../src/locale/zh_CN';
import enUS from '../src/locale/en_US';
import '../assets/index.less';

// const defaultValue = moment('2019-09-03');
const defaultValue = moment('2019-11-28');

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
  },
};

export default () => {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <div>
      <h1>Value: {value.format('YYYY-MM-DD')}</h1>

      <h3>Basic</h3>
      <Picker<Moment>
        prefixCls="rc-picker"
        generateConfig={generateConfig}
        value={value}
        locale={zhCN}
        onSelect={setValue}
      />

      <h3>1 Month earlier</h3>
      <Picker<Moment>
        prefixCls="rc-picker"
        generateConfig={generateConfig}
        value={value}
        defaultPickerValue={defaultValue.clone().subtract(1, 'month')}
        locale={enUS}
        onSelect={setValue}
      />
    </div>
  );
};

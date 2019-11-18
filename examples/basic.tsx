import React from 'react';
import moment, { Moment } from 'moment';
import DatePanel from '../src/panels/DatePanel';
import { GenerateConfig } from '../src/generate';
import '../assets/index.less';

// const defaultValue = moment('2019-09-03');
const defaultValue = moment('2019-11-28');

const generateConfig: GenerateConfig<Moment> = {
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
  getWeekDay: date => date.weekday(),
  getDate: date => date.date(),
  isSameDate: (date1, date2) => date1.isSame(date2, 'day'),

  locale: {
    getWeekFirstDay: locale => {
      const date = moment().locale(locale);
      return date.localeData().firstDayOfWeek();
    },
    getWeekDays: locale => {
      const date = moment().locale(locale);
      return date.localeData().weekdaysMin();
    },
  },
};

export default () => {
  return (
    <div>
      {defaultValue.toString()}

      <DatePanel<Moment>
        prefixCls="rc-picker"
        generateConfig={generateConfig}
        value={defaultValue}
        locale="zh-cn"
      />
      <DatePanel<Moment>
        prefixCls="rc-picker"
        generateConfig={generateConfig}
        value={defaultValue}
        locale="en-us"
      />
    </div>
  );
};

import React from 'react';
import moment from 'moment';
import DatePanel from '../src/panels/DatePanel';
import { GenerateConfig } from '../src/generate';

const generateConfig: GenerateConfig = {
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
      <DatePanel generateConfig={generateConfig} />
    </div>
  );
};

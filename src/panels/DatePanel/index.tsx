import * as React from 'react';
import classNames from 'classnames';
import { GenerateConfig } from '../../generate';
import { WEEK_DAY_COUNT, getVisibleDates } from '../../utils/dateUtil';
import DateBody from './DateBody';
import DateHeader from './DateHeader';

const DATE_ROW_COUNT = 6;

export interface DatePanelProps<DateType> {
  prefixCls: string;
  generateConfig: GenerateConfig<DateType>;
  value: DateType;
  locale: string;
}

function DatePanel<DateType>(props: DatePanelProps<DateType>) {
  const { prefixCls, value } = props;
  const currentDate = value;

  return (
    <div className={`${prefixCls}-date-panel`}>
      <DateHeader />
      <DateBody {...props} value={currentDate} rowCount={DATE_ROW_COUNT} />
    </div>
  );
}

export default DatePanel;

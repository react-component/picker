import * as React from 'react';
import DateBody from './DateBody';
import DateHeader from './DateHeader';
import { PanelSharedProps } from '../../interface';

const DATE_ROW_COUNT = 6;

export type DatePanelProps<DateType> = PanelSharedProps<DateType>;

function DatePanel<DateType>(props: DatePanelProps<DateType>) {
  const {
    prefixCls,
    generateConfig,
    value,
    viewDate,
    onViewDateChange,
    onPanelChange,
  } = props;
  const panelPrefixCls = `${prefixCls}-date-panel`;

  // ==================== View Operation ====================
  const onYearChange = (diff: number) => {
    onViewDateChange(generateConfig.addYear(viewDate, diff));
  };
  const onMonthChange = (diff: number) => {
    onViewDateChange(generateConfig.addMonth(viewDate, diff));
  };

  return (
    <div className={panelPrefixCls}>
      <DateHeader
        {...props}
        prefixCls={panelPrefixCls}
        value={value}
        viewDate={viewDate}
        // View Operation
        onPrevYear={() => {
          onYearChange(-1);
        }}
        onNextYear={() => {
          onYearChange(1);
        }}
        onPrevMonth={() => {
          onMonthChange(-1);
        }}
        onNextMonth={() => {
          onMonthChange(1);
        }}
        onMonthClick={() => {
          onPanelChange('month', value);
        }}
        onYearClick={() => {
          onPanelChange('year', value);
        }}
      />
      <DateBody
        {...props}
        prefixCls={panelPrefixCls}
        value={value}
        viewDate={viewDate}
        rowCount={DATE_ROW_COUNT}
      />
    </div>
  );
}

export default DatePanel;

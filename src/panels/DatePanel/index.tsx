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
    onSelect,
    onViewDateChange,
    onPanelChange,
  } = props;
  const panelPrefixCls = `${prefixCls}-date-panel`;

  const onInternalSelect = (newValue: DateType) => {
    if (onSelect) {
      onSelect(newValue);
    }
  };

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
          onPanelChange('month');
        }}
        onYearClick={() => {
          onPanelChange('year');
        }}
      />
      <DateBody
        {...props}
        prefixCls={panelPrefixCls}
        value={value}
        viewDate={viewDate}
        rowCount={DATE_ROW_COUNT}
        onSelect={onInternalSelect}
      />
    </div>
  );
}

export default DatePanel;

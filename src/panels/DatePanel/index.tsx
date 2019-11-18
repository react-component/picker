import * as React from 'react';
import { GenerateConfig } from '../../generate';
import DateBody from './DateBody';
import DateHeader from './DateHeader';
import { Locale } from '../../interface';

const DATE_ROW_COUNT = 6;

export interface DatePanelProps<DateType> {
  prefixCls: string;
  generateConfig: GenerateConfig<DateType>;
  value: DateType;
  locale: Locale;
  onSelect?: (value: DateType) => void;
}

function DatePanel<DateType>(props: DatePanelProps<DateType>) {
  const { prefixCls, generateConfig, value, onSelect } = props;
  const panelPrefixCls = `${prefixCls}-date-panel`;

  const currentDate = value;
  const [viewDate, setViewDate] = React.useState(value);

  const onInternalSelect = (newValue: DateType) => {
    if (onSelect) {
      onSelect(newValue);
    }
  };

  // ==================== View Operation ====================
  const onYearChange = (diff: number) => {
    setViewDate(generateConfig.addYear(viewDate, diff));
  };
  const onMonthChange = (diff: number) => {
    setViewDate(generateConfig.addMonth(viewDate, diff));
  };

  return (
    <div className={panelPrefixCls}>
      <DateHeader
        {...props}
        prefixCls={panelPrefixCls}
        value={currentDate}
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
      />
      <DateBody
        {...props}
        prefixCls={panelPrefixCls}
        value={currentDate}
        viewDate={viewDate}
        rowCount={DATE_ROW_COUNT}
        onSelect={onInternalSelect}
      />
    </div>
  );
}

export default DatePanel;

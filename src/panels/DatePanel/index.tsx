import * as React from 'react';
import KeyCode from 'rc-util/lib/KeyCode';
import DateBody from './DateBody';
import DateHeader from './DateHeader';
import { PanelSharedProps } from '../../interface';
import { WEEK_DAY_COUNT } from '../../utils/dateUtil';

const DATE_ROW_COUNT = 6;

export type DatePanelProps<DateType> = PanelSharedProps<DateType>;

function DatePanel<DateType>(props: DatePanelProps<DateType>) {
  const {
    prefixCls,
    operationRef,
    generateConfig,
    value,
    viewDate,
    onViewDateChange,
    onPanelChange,
    onSelect,
  } = props;
  const panelPrefixCls = `${prefixCls}-date-panel`;

  // ======================= Keyboard =======================
  operationRef.current = {
    onKeyDown: ({ which, ctrlKey, metaKey }) => {
      switch (which) {
        case KeyCode.LEFT:
          if (ctrlKey || metaKey) {
            onSelect(generateConfig.addYear(value, -1));
          } else {
            onSelect(generateConfig.addDate(value, -1));
          }

          break;
        case KeyCode.RIGHT:
          if (ctrlKey || metaKey) {
            onSelect(generateConfig.addYear(value, 1));
          } else {
            onSelect(generateConfig.addDate(value, 1));
          }
          break;

        case KeyCode.UP:
          onSelect(generateConfig.addDate(value, -WEEK_DAY_COUNT));
          break;
        case KeyCode.DOWN:
          onSelect(generateConfig.addDate(value, WEEK_DAY_COUNT));
          break;

        case KeyCode.PAGE_UP:
          onSelect(generateConfig.addMonth(value, -1));
          break;
        case KeyCode.PAGE_DOWN:
          onSelect(generateConfig.addMonth(value, 1));
          break;
      }
    },
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

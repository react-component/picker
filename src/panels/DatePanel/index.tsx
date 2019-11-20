import * as React from 'react';
import classNames from 'classnames';
import DateBody from './DateBody';
import DateHeader from './DateHeader';
import { PanelSharedProps } from '../../interface';
import { WEEK_DAY_COUNT } from '../../utils/dateUtil';
import { createKeyDownHandler } from '../../utils/uiUtil';

const DATE_ROW_COUNT = 6;

export interface DatePanelProps<DateType> extends PanelSharedProps<DateType> {
  active?: boolean;
}

function DatePanel<DateType>(props: DatePanelProps<DateType>) {
  const {
    prefixCls,
    active,
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
    onKeyDown: event => {
      createKeyDownHandler(event, {
        onLeftRight: diff => {
          onSelect(generateConfig.addDate(value, diff));
        },
        onCtrlLeftRight: diff => {
          onSelect(generateConfig.addYear(value, diff));
        },
        onUpDown: diff => {
          onSelect(generateConfig.addDate(value, diff * WEEK_DAY_COUNT));
        },
        onPageUpDown: diff => {
          onSelect(generateConfig.addMonth(value, diff));
        },
      });
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
    <div
      className={classNames(panelPrefixCls, {
        [`${panelPrefixCls}-active`]: active,
      })}
    >
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

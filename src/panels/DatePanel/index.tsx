import * as React from 'react';
import classNames from 'classnames';
import type { DateBodyPassProps, DateRender } from './DateBody';
import DateBody from './DateBody';
import DateHeader from './DateHeader';
import type { PanelSharedProps } from '../../interface';
import { WEEK_DAY_COUNT } from '../../utils/dateUtil';
import type { KeyboardConfig } from '../../utils/uiUtil';
import { createKeyDownHandler } from '../../utils/uiUtil';

const DATE_ROW_COUNT = 6;

export type DatePanelProps<DateType> = {
  active?: boolean;
  dateRender?: DateRender<DateType>;

  // Used for week panel
  panelName?: string;
  keyboardConfig?: KeyboardConfig;
} & PanelSharedProps<DateType> & DateBodyPassProps<DateType>;

function DatePanel<DateType>(props: DatePanelProps<DateType>) {
  const {
    prefixCls,
    panelName = 'date',
    keyboardConfig,
    active,
    operationRef,
    generateConfig,
    value,
    viewDate,
    onViewDateChange,
    onPanelChange,
    onSelect,
  } = props;
  const panelPrefixCls = `${prefixCls}-${panelName}-panel`;

  // ======================= Keyboard =======================
  operationRef.current = {
    onKeyDown: event =>
      createKeyDownHandler(event, {
        onLeftRight: diff => {
          onSelect(generateConfig.addDate(value || viewDate, diff), 'key');
        },
        onCtrlLeftRight: diff => {
          onSelect(generateConfig.addYear(value || viewDate, diff), 'key');
        },
        onUpDown: diff => {
          onSelect(generateConfig.addDate(value || viewDate, diff * WEEK_DAY_COUNT), 'key');
        },
        onPageUpDown: diff => {
          onSelect(generateConfig.addMonth(value || viewDate, diff), 'key');
        },
        ...keyboardConfig,
      }),
  };

  // ==================== View Operation ====================
  const onYearChange = (diff: number) => {
    const newDate = generateConfig.addYear(viewDate, diff);
    onViewDateChange(newDate);
    onPanelChange(null, newDate);
  };
  const onMonthChange = (diff: number) => {
    const newDate = generateConfig.addMonth(viewDate, diff);
    onViewDateChange(newDate);
    onPanelChange(null, newDate);
  };

  return (
    <div
      className={classNames(panelPrefixCls, {
        [`${panelPrefixCls}-active`]: active,
      })}
    >
      <DateHeader
        {...props}
        prefixCls={prefixCls}
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
          onPanelChange('month', viewDate);
        }}
        onYearClick={() => {
          onPanelChange('year', viewDate);
        }}
      />
      <DateBody
        {...props}
        onSelect={date => onSelect(date, 'mouse')}
        prefixCls={prefixCls}
        value={value}
        viewDate={viewDate}
        rowCount={DATE_ROW_COUNT}
      />
    </div>
  );
}

export default DatePanel;

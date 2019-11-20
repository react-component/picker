import * as React from 'react';
import KeyCode from 'rc-util/lib/KeyCode';
import MonthHeader from './MonthHeader';
import MonthBody, { MONTH_COL_COUNT } from './MonthBody';
import { PanelSharedProps } from '../../interface';

export type MonthPanelProps<DateType> = PanelSharedProps<DateType>;

function MonthPanel<DateType>(props: MonthPanelProps<DateType>) {
  const {
    prefixCls,
    operationRef,
    onViewDateChange,
    generateConfig,
    value,
    viewDate,
    onPanelChange,
    onSelect,
  } = props;

  const panelPrefixCls = `${prefixCls}-month-panel`;

  // ======================= Keyboard =======================
  operationRef.current = {
    onKeyDown: ({ which, ctrlKey, metaKey }) => {
      switch (which) {
        case KeyCode.LEFT:
          if (ctrlKey || metaKey) {
            onSelect(generateConfig.addYear(value, -1));
          } else {
            onSelect(generateConfig.addMonth(value, -1));
          }

          break;
        case KeyCode.RIGHT:
          if (ctrlKey || metaKey) {
            onSelect(generateConfig.addYear(value, 1));
          } else {
            onSelect(generateConfig.addMonth(value, 1));
          }
          break;

        case KeyCode.UP:
          onSelect(generateConfig.addMonth(value, -MONTH_COL_COUNT));
          break;
        case KeyCode.DOWN:
          onSelect(generateConfig.addMonth(value, MONTH_COL_COUNT));
          break;

        case KeyCode.ENTER:
          onPanelChange('date', value);
          break;
      }
    },
  };

  // ==================== View Operation ====================
  const onYearChange = (diff: number) => {
    onViewDateChange(generateConfig.addYear(viewDate, diff));
  };

  return (
    <div className={panelPrefixCls}>
      <MonthHeader
        {...props}
        prefixCls={panelPrefixCls}
        onPrevYear={() => {
          onYearChange(-1);
        }}
        onNextYear={() => {
          onYearChange(1);
        }}
        onYearClick={() => {
          onPanelChange('year', value);
        }}
      />
      <MonthBody
        {...props}
        prefixCls={panelPrefixCls}
        onSelect={date => {
          onSelect(date);
          onPanelChange('date', date);
        }}
      />
    </div>
  );
}

export default MonthPanel;

import * as React from 'react';
import MonthHeader from './MonthHeader';
import MonthBody, { MONTH_COL_COUNT, MonthCellRender } from './MonthBody';
import { PanelSharedProps } from '../../interface';
import { createKeyDownHandler } from '../../utils/uiUtil';

export interface MonthPanelProps<DateType> extends PanelSharedProps<DateType> {
  monthCellContentRender?: MonthCellRender<DateType>;
}

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
    onKeyDown: event =>
      createKeyDownHandler(event, {
        onLeftRight: diff => {
          onSelect(generateConfig.addMonth(value || viewDate, diff), 'key');
        },
        onCtrlLeftRight: diff => {
          onSelect(generateConfig.addYear(value || viewDate, diff), 'key');
        },
        onUpDown: diff => {
          onSelect(
            generateConfig.addMonth(value || viewDate, diff * MONTH_COL_COUNT),
            'key',
          );
        },
        onEnter: () => {
          onPanelChange('date', value || viewDate);
        },
      }),
  };

  // ==================== View Operation ====================
  const onYearChange = (diff: number) => {
    onViewDateChange(generateConfig.addYear(viewDate, diff));
  };

  return (
    <div className={panelPrefixCls}>
      <MonthHeader
        {...props}
        prefixCls={prefixCls}
        onPrevYear={() => {
          onYearChange(-1);
        }}
        onNextYear={() => {
          onYearChange(1);
        }}
        onYearClick={() => {
          onPanelChange('year', viewDate);
        }}
      />
      <MonthBody<DateType>
        {...props}
        prefixCls={prefixCls}
        onSelect={date => {
          onSelect(date, 'mouse');
          onPanelChange('date', date);
        }}
      />
    </div>
  );
}

export default MonthPanel;

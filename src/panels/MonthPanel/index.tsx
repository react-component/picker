import * as React from 'react';
import MonthHeader from './MonthHeader';
import MonthBody from './MonthBody';
import { PanelSharedProps } from '../../interface';

export type MonthPanelProps<DateType> = PanelSharedProps<DateType>;

function MonthPanel<DateType>(props: MonthPanelProps<DateType>) {
  const {
    prefixCls,
    onViewDateChange,
    generateConfig,
    value,
    viewDate,
    onPanelChange,
    onSelect,
  } = props;

  const panelPrefixCls = `${prefixCls}-month-panel`;

  const onYearChange = (diff: number) => {
    onViewDateChange(generateConfig.addYear(viewDate, diff));
  };

  const onInternalSelect = (newValue: DateType) => {
    if (onSelect) {
      onSelect(newValue);
    }
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
        onSelect={onInternalSelect}
      />
    </div>
  );
}

export default MonthPanel;

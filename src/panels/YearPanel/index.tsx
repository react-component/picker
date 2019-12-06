import * as React from 'react';
import YearHeader from './YearHeader';
import YearBody, { YEAR_COL_COUNT } from './YearBody';
import { PanelSharedProps } from '../../interface';
import { createKeyDownHandler } from '../../utils/uiUtil';

export type YearPanelProps<DateType> = PanelSharedProps<DateType>;

export const YEAR_DECADE_COUNT = 10;

function YearPanel<DateType>(props: YearPanelProps<DateType>) {
  const {
    prefixCls,
    operationRef,
    onViewDateChange,
    generateConfig,
    value,
    viewDate,
    onSelect,
    onPanelChange,
  } = props;

  const panelPrefixCls = `${prefixCls}-year-panel`;

  // ======================= Keyboard =======================
  operationRef.current = {
    onKeyDown: event =>
      createKeyDownHandler(event, {
        onLeftRight: diff => {
          onSelect(generateConfig.addYear(value || viewDate, diff), 'key');
        },
        onCtrlLeftRight: diff => {
          onSelect(
            generateConfig.addYear(value || viewDate, diff * YEAR_DECADE_COUNT),
            'key',
          );
        },
        onUpDown: diff => {
          onSelect(
            generateConfig.addYear(value || viewDate, diff * YEAR_COL_COUNT),
            'key',
          );
        },
        onEnter: () => {
          onPanelChange('month', value || viewDate);
        },
      }),
  };

  // ==================== View Operation ====================
  const onDecadeChange = (diff: number) => {
    onViewDateChange(generateConfig.addYear(viewDate, diff * 10));
  };

  return (
    <div className={panelPrefixCls}>
      <YearHeader
        {...props}
        prefixCls={prefixCls}
        onPrevDecade={() => {
          onDecadeChange(-1);
        }}
        onNextDecade={() => {
          onDecadeChange(1);
        }}
        onDecadeClick={() => {
          onPanelChange('decade', viewDate);
        }}
      />
      <YearBody
        {...props}
        prefixCls={prefixCls}
        onSelect={date => {
          onPanelChange('month', date);
          onSelect(date, 'mouse');
        }}
      />
    </div>
  );
}

export default YearPanel;

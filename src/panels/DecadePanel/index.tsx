import * as React from 'react';
import DecadeHeader from './DecadeHeader';
import DecadeBody from './DecadeBody';
import { PanelSharedProps } from '../../interface';
import { createKeyDownHandler } from '../../utils/uiUtil';

export type DecadePanelProps<DateType> = PanelSharedProps<DateType>;

export const DECADE_UNIT_DIFF = 10;
export const DECADE_DISTANCE_COUNT = DECADE_UNIT_DIFF * 10;

function DecadePanel<DateType>(props: DecadePanelProps<DateType>) {
  const {
    prefixCls,
    onViewDateChange,
    generateConfig,
    viewDate,
    operationRef,
    onSelect,
    onPanelChange,
  } = props;

  const panelPrefixCls = `${prefixCls}-year-panel`;

  // ======================= Keyboard =======================
  operationRef.current = {
    onKeyDown: event =>
      createKeyDownHandler(event, {
        onLeftRight: diff => {
          console.log('>>>>', diff);
          onSelect(generateConfig.addYear(viewDate, diff * DECADE_UNIT_DIFF));
        },
        // onCtrlLeftRight: diff => {
        //   onSelect(generateConfig.addYear(value, diff * YEAR_DECADE_COUNT));
        // },
        // onUpDown: diff => {
        //   onSelect(generateConfig.addYear(value, diff * YEAR_COL_COUNT));
        // },
        // onEnter: () => {
        //   onSelect(viewDate);
        // },
      }),
  };

  // ==================== View Operation ====================
  const onDecadesChange = (diff: number) => {
    onViewDateChange(
      generateConfig.addYear(viewDate, diff * DECADE_DISTANCE_COUNT),
    );
  };

  const onInternalSelect = (date: DateType) => {
    onSelect(date);
    onPanelChange('year', date);
  };

  return (
    <div className={panelPrefixCls}>
      <DecadeHeader
        {...props}
        prefixCls={panelPrefixCls}
        onPrevDecades={() => {
          onDecadesChange(-1);
        }}
        onNextDecades={() => {
          onDecadesChange(1);
        }}
      />
      <DecadeBody
        {...props}
        prefixCls={panelPrefixCls}
        onSelect={onInternalSelect}
      />
    </div>
  );
}

export default DecadePanel;

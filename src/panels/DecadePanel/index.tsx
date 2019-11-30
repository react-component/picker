import * as React from 'react';
import DecadeHeader from './DecadeHeader';
import DecadeBody, { DECADE_COL_COUNT } from './DecadeBody';
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

  const panelPrefixCls = `${prefixCls}-decade-panel`;

  // ======================= Keyboard =======================
  operationRef.current = {
    onKeyDown: event =>
      createKeyDownHandler(event, {
        onLeftRight: diff => {
          onSelect(generateConfig.addYear(viewDate, diff * DECADE_UNIT_DIFF));
        },
        onCtrlLeftRight: diff => {
          onSelect(
            generateConfig.addYear(viewDate, diff * DECADE_DISTANCE_COUNT),
          );
        },
        onUpDown: diff => {
          onSelect(
            generateConfig.addYear(
              viewDate,
              diff * DECADE_UNIT_DIFF * DECADE_COL_COUNT,
            ),
          );
        },
        onEnter: () => {
          onPanelChange('year', viewDate);
        },
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
        prefixCls={prefixCls}
        onPrevDecades={() => {
          onDecadesChange(-1);
        }}
        onNextDecades={() => {
          onDecadesChange(1);
        }}
      />
      <DecadeBody
        {...props}
        prefixCls={prefixCls}
        onSelect={onInternalSelect}
      />
    </div>
  );
}

export default DecadePanel;

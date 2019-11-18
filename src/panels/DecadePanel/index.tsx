import * as React from 'react';
import DecadeHeader from './DecadeHeader';
import DecadeBody from './DecadeBody';
import { PanelSharedProps } from '../../interface';

export type DecadePanelProps<DateType> = Omit<
  PanelSharedProps<DateType>,
  'onPanelChange'
>;

export const DECADE_DISTANCE_COUNT = 100;

function DecadePanel<DateType>(props: DecadePanelProps<DateType>) {
  const {
    prefixCls,
    onViewDateChange,
    generateConfig,
    viewDate,
    onSelect,
  } = props;

  const panelPrefixCls = `${prefixCls}-year-panel`;

  const onDecadesChange = (diff: number) => {
    onViewDateChange(
      generateConfig.addYear(viewDate, diff * DECADE_DISTANCE_COUNT),
    );
  };

  const onInternalSelect = (newValue: DateType) => {
    if (onSelect) {
      onSelect(newValue);
    }
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

import { clsx } from 'clsx';
import * as React from 'react';
import type { SharedPanelProps } from '../../interface';
import { formatValue } from '../../utils/dateUtil';
import { PanelContext, useInfo } from '../context';
import PanelHeader from '../PanelHeader';
import TimePanelBody from './TimePanelBody';

export type TimePanelProps<DateType extends object> = SharedPanelProps<DateType>;

export default function TimePanel<DateType extends object = any>(props: TimePanelProps<DateType>) {
  const {
    prefixCls,
    value,
    locale,
    generateConfig,

    // Format
    showTime,
  } = props;

  const { format } = showTime || {};

  const panelPrefixCls = `${prefixCls}-time-panel`;

  // ========================== Base ==========================
  const [info] = useInfo(props, 'time');

  // ========================= Render =========================
  return (
    <PanelContext.Provider value={info}>
      <div className={clsx(panelPrefixCls)}>
        <PanelHeader>
          {value ? formatValue(value, { locale, format, generateConfig }) : '\u00A0'}
        </PanelHeader>
        <TimePanelBody {...showTime} />
      </div>
    </PanelContext.Provider>
  );
}

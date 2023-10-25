import classNames from 'classnames';
import * as React from 'react';
import { formatValue } from '../../../utils/dateUtil';
import type { SharedPanelProps } from '../../interface';
import { PanelContext, useInfo } from '../context';
import PanelHeader from '../PanelHeader';
import TimePanelBody from './TimePanelBody';

export default function TimePanel<DateType = any>(props: SharedPanelProps<DateType>) {
  const {
    prefixCls,
    value,
    locale,
    generateConfig,

    // Format
    time = {},
  } = props;

  const { format = 'HH:mm:ss' } = time;

  const panelPrefixCls = `${prefixCls}-time-panel`;

  // ========================== Base ==========================
  const [info, now] = useInfo(props);

  // ========================= Render =========================
  const formatTimeStr = formatValue(value, {
    locale,
    format,
    generateConfig,
  });

  return (
    <PanelContext.Provider
      value={{
        type: 'date',
        ...info,
      }}
    >
      <div className={classNames(panelPrefixCls)}>
        <PanelHeader>{value ? formatTimeStr : '\u00A0'}</PanelHeader>
        <TimePanelBody {...time} format={format} />
      </div>
    </PanelContext.Provider>
  );
}

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
    showTime = {},
  } = props;

  const { format = 'HH:mm:ss' } = showTime;

  const panelPrefixCls = `${prefixCls}-time-panel`;

  // ========================== Base ==========================
  const [info, now] = useInfo(props);

  const mergedValue = value || now;

  // ========================= Render =========================
  const formatTimeStr = formatValue(mergedValue, {
    locale,
    format,
    generateConfig,
  });

  return (
    <PanelContext.Provider
      value={{
        type: 'date',
        ...info,
        value: mergedValue,
      }}
    >
      <div className={classNames(panelPrefixCls)}>
        <PanelHeader>{mergedValue ? formatTimeStr : '\u00A0'}</PanelHeader>
        <TimePanelBody {...showTime} format={format} />
      </div>
    </PanelContext.Provider>
  );
}

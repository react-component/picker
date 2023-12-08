import classNames from 'classnames';
import * as React from 'react';
import { formatValue } from '../../../utils/dateUtil';
import type { InternalMode, SharedPanelProps } from '../../interface';
import { PanelContext, useInfo } from '../context';
import PanelHeader from '../PanelHeader';
import TimePanelBody from './TimePanelBody';

export interface TimePanelProps<DateType> extends SharedPanelProps<DateType> {
  /** Used for `DateTimePanel` */
  mode?: InternalMode;
}

export default function TimePanel<DateType = any>(props: TimePanelProps<DateType>) {
  const {
    prefixCls,
    value,
    locale,
    generateConfig,
    mode = 'time',

    // Format
    showTime = {},
  } = props;

  const { format = 'HH:mm:ss' } = showTime;

  const panelPrefixCls = `${prefixCls}-time-panel`;

  // ========================== Base ==========================
  const [info] = useInfo(props, mode);

  // ========================= Render =========================
  return (
    <PanelContext.Provider value={info}>
      <div className={classNames(panelPrefixCls)}>
        <PanelHeader>
          {value
            ? formatValue(value, {
                locale,
                format,
                generateConfig,
              })
            : '\u00A0'}
        </PanelHeader>
        <TimePanelBody {...showTime} format={format} />
      </div>
    </PanelContext.Provider>
  );
}

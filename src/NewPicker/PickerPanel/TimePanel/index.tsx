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
    format = 'HH:mm:ss',
  } = props;

  const panelPrefixCls = `${prefixCls}-time-panel`;

  // ========================== Base ==========================
  const [info, now] = useInfo(props);

  // ========================= Render =========================
  return (
    <PanelContext.Provider
      value={{
        type: 'date',
        ...info,
      }}
    >
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
        <TimePanelBody {...props} format={format} />
      </div>
    </PanelContext.Provider>
  );
}

import * as React from 'react';
import classNames from 'classnames';
import DatePanel from '../DatePanel';
import { PanelSharedProps } from '../../interface';

export type WeekPanelProps<DateType> = PanelSharedProps<DateType>;

function WeekPanel<DateType>(props: WeekPanelProps<DateType>) {
  const { prefixCls, generateConfig, locale } = props;

  const cellPrefixCls = `${prefixCls}-week-panel-cell`;
  const prefixColumn = (date: DateType) => (
    <td
      key="week"
      className={classNames(cellPrefixCls, `${cellPrefixCls}-week`)}
    >
      {generateConfig.locale.getWeek(locale.locale, date)}
    </td>
  );

  return <DatePanel {...props} panelName="week" prefixColumn={prefixColumn} />;
}

export default WeekPanel;

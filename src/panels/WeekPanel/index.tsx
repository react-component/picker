import * as React from 'react';
import classNames from 'classnames';
import DatePanel from '../DatePanel';
import { PanelSharedProps } from '../../interface';
import { isSameWeek } from '../../utils/dateUtil';

export type WeekPanelProps<DateType> = PanelSharedProps<DateType>;

function WeekPanel<DateType>(props: WeekPanelProps<DateType>) {
  const { prefixCls, generateConfig, locale, value } = props;

  // Render additional column
  const cellPrefixCls = `${prefixCls}-week-panel-cell`;
  const prefixColumn = (date: DateType) => (
    <td
      key="week"
      className={classNames(cellPrefixCls, `${cellPrefixCls}-week`)}
    >
      {generateConfig.locale.getWeek(locale.locale, date)}
    </td>
  );

  // Add row className
  const rowPrefixCls = `${prefixCls}-week-panel-row`;
  const rowClassName = (date: DateType) =>
    classNames(rowPrefixCls, {
      [`${rowPrefixCls}-selected`]: isSameWeek(
        generateConfig,
        locale.locale,
        value,
        date,
      ),
    });

  return (
    <DatePanel
      {...props}
      panelName="week"
      prefixColumn={prefixColumn}
      rowClassName={rowClassName}
    />
  );
}

export default WeekPanel;

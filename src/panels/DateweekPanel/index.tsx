import * as React from 'react';
import classNames from 'classnames';
import type { DatePanelProps } from '../DatePanel';
import DatePanel from '../DatePanel';

export type DateweekPanelProps<DateType> = {
  //disabledTime?: DisabledTime<DateType>;
  showWeek?: boolean;
  defaultValue?: DateType;
} & DatePanelProps<DateType>;

function DateweekPanel<DateType>(props: DateweekPanelProps<DateType>) {
  const { prefixCls, generateConfig, locale, active } = props;
  const panelPrefixCls = `${prefixCls}-dateweek-panel`;

  // ======================== Render ========================
  // Render additional column
  const cellPrefixCls = `${prefixCls}-cell`;
  const prefixColumn = (date: DateType) => (
    <td key="week" className={classNames(cellPrefixCls, `${cellPrefixCls}-week`)}>
      {generateConfig.locale.getWeek(locale.locale, date)}
    </td>
  );

  return (
    <div
      className={classNames(panelPrefixCls, {
        [`${panelPrefixCls}-active`]: active,
      })}
    >
      <DatePanel
        {...props}
        prefixColumn={prefixColumn}
        keyboardConfig={{
          onLeftRight: null,
        }}
      />
    </div>
  );
}

export default DateweekPanel;

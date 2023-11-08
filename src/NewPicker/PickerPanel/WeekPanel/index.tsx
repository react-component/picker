import classNames from 'classnames';
import * as React from 'react';
import { isSameWeek } from '../../../utils/dateUtil';
import type { SharedPanelProps } from '../../interface';
import DatePanel from '../DatePanel';

export default function WeekPanel<DateType = any>(props: SharedPanelProps<DateType>) {
  const { prefixCls, generateConfig, locale, value, hoverValue } = props;

  // =============================== Row ================================
  const rowPrefixCls = `${prefixCls}-week-panel-row`;

  const rowClassName = (date: DateType) => {
    // const isRangeStart = isSameWeek(generateConfig, locale.locale, rangeStart, date);
    // const isRangeEnd = isSameWeek(generateConfig, locale.locale, rangeEnd, date);

    return classNames(rowPrefixCls, {
      [`${rowPrefixCls}-selected`]:
        !hoverValue && isSameWeek(generateConfig, locale.locale, value, date),

      // Patch for hover range
      // [`${rowPrefixCls}-range-start`]: isRangeStart,
      // [`${rowPrefixCls}-range-end`]: isRangeEnd,
      // [`${rowPrefixCls}-range-hover`]:
      //   !isRangeStart && !isRangeEnd && isInRange(generateConfig, rangeStart, rangeEnd, date),
    });
  };

  // ============================== Render ==============================
  return <DatePanel {...props} mode="week" panelName="week" rowClassName={rowClassName} />;
}

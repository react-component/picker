import classNames from 'classnames';
import * as React from 'react';
import { isSameWeek } from '../../../utils/dateUtil';
import type { SharedPanelProps } from '../../interface';
import DatePanel from '../DatePanel';

export default function WeekPanel<DateType = any>(props: SharedPanelProps<DateType>) {
  const { disabledDate, prefixCls, onChange, onHover, generateConfig, locale, value, hoverValue } =
    props;

  const cellPrefixCls = `${prefixCls}-cell`;

  // =========================== PrefixColumn ===========================
  const prefixColumn = (date: DateType) => {
    // >>> Additional check for disabled
    const disabled = disabledDate?.(date, { type: 'week' });

    return (
      <td
        key="week"
        className={classNames(cellPrefixCls, `${cellPrefixCls}-week`, {
          [`${cellPrefixCls}-disabled`]: disabled,
        })}
        // Operation: Same as code in PanelBody
        onClick={() => {
          if (!disabled) {
            onChange(date);
          }
        }}
        onMouseEnter={() => {
          if (!disabled) {
            onHover(date);
          }
        }}
        onMouseLeave={() => {
          if (!disabled) {
            onHover(null);
          }
        }}
      >
        <div className={`${cellPrefixCls}-inner`}>
          {generateConfig.locale.getWeek(locale.locale, date)}
        </div>
      </td>
    );
  };

  // =============================== Row ================================
  const rowPrefixCls = `${prefixCls}-week-panel-row`;

  const rowClassName = (date: DateType) => {
    // const isRangeStart = isSameWeek(generateConfig, locale.locale, rangeStart, date);
    // const isRangeEnd = isSameWeek(generateConfig, locale.locale, rangeEnd, date);

    return classNames(rowPrefixCls, {
      [`${rowPrefixCls}-selected`]:
        !hoverValue && isSameWeek(generateConfig, locale.locale, value, date),
      // [`${rowPrefixCls}-selected`]:
      //   !rangedValue && isSameWeek(generateConfig, locale.locale, value, date),

      // Patch for hover range
      // [`${rowPrefixCls}-range-start`]: isRangeStart,
      // [`${rowPrefixCls}-range-end`]: isRangeEnd,
      // [`${rowPrefixCls}-range-hover`]:
      //   !isRangeStart && !isRangeEnd && isInRange(generateConfig, rangeStart, rangeEnd, date),
    });
  };

  // ============================== Render ==============================
  return (
    <DatePanel
      {...props}
      mode="date"
      panelName="week"
      prefixColumn={prefixColumn}
      rowClassName={rowClassName}
    />
  );
}

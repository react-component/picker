import classNames from 'classnames';
import * as React from 'react';
import type { PanelSharedProps } from '../../interface';
import PanelContext from '../../PanelContext';
import RangeContext from '../../RangeContext';
import { getCellDateDisabled, isInRange, isSameWeek } from '../../utils/dateUtil';
import DatePanel from '../DatePanel';

export type WeekPanelProps<DateType> = PanelSharedProps<DateType>;

function WeekPanel<DateType>(props: WeekPanelProps<DateType>) {
  const { prefixCls, generateConfig, locale, value, disabledDate, onSelect } = props;

  const { rangedValue, hoverRangedValue } = React.useContext(RangeContext);
  const { onDateMouseEnter, onDateMouseLeave } = React.useContext(PanelContext);

  const rangeStart = rangedValue?.[0] || hoverRangedValue?.[0];
  const rangeEnd = rangedValue?.[1] || hoverRangedValue?.[1];

  // Render additional column
  const cellPrefixCls = `${prefixCls}-cell`;

  const prefixColumn = (date: DateType) => {
    // >>> Additional check for disabled
    const disabled = getCellDateDisabled({
      cellDate: date,
      mode: 'week',
      disabledDate,
      generateConfig,
    });

    return (
      <td
        key="week"
        className={classNames(cellPrefixCls, `${cellPrefixCls}-week`)}
        // Operation: Same as code in PanelBody
        onClick={() => {
          if (!disabled) {
            onSelect(date, 'mouse');
          }
        }}
        onMouseEnter={() => {
          if (!disabled && onDateMouseEnter) {
            onDateMouseEnter(date);
          }
        }}
        onMouseLeave={() => {
          if (!disabled && onDateMouseLeave) {
            onDateMouseLeave(date);
          }
        }}
      >
        {generateConfig.locale.getWeek(locale.locale, date)}
      </td>
    );
  };

  // Add row className
  const rowPrefixCls = `${prefixCls}-week-panel-row`;

  const rowClassName = (date: DateType) => {
    const isRangeStart = isSameWeek(generateConfig, locale.locale, rangeStart, date);
    const isRangeEnd = isSameWeek(generateConfig, locale.locale, rangeEnd, date);
    return classNames(rowPrefixCls, {
      [`${rowPrefixCls}-selected`]: isSameWeek(generateConfig, locale.locale, value, date),

      // Patch for hover range
      [`${rowPrefixCls}-range-start`]: isRangeStart,
      [`${rowPrefixCls}-range-end`]: isRangeEnd,
      [`${rowPrefixCls}-range-hover`]:
        !isRangeStart && !isRangeEnd && isInRange(generateConfig, rangeStart, rangeEnd, date),
    });
  };

  return (
    <DatePanel
      {...props}
      panelName="week"
      prefixColumn={prefixColumn}
      rowClassName={rowClassName}
      keyboardConfig={{
        onLeftRight: null,
      }}
    />
  );
}

export default WeekPanel;

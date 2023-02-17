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

  const rangeStart = hoverRangedValue?.[0] || rangedValue?.[0];
  const rangeEnd = hoverRangedValue?.[1] || rangedValue?.[1];

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
        <div className={`${cellPrefixCls}-inner`}>
          {generateConfig.locale.getWeek(locale.locale, date)}
        </div>
      </td>
    );
  };

  // Add row className
  const rowPrefixCls = `${prefixCls}-week-panel-row`;

  const rowClassName = (date: DateType) => {
    const isRangeStart = isSameWeek(generateConfig, locale.locale, rangeStart, date);
    const isRangeEnd = isSameWeek(generateConfig, locale.locale, rangeEnd, date);
    return classNames(rowPrefixCls, {
      [`${rowPrefixCls}-selected`]:
        !rangedValue && isSameWeek(generateConfig, locale.locale, value, date),

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
      // No need check cell level
      isSameCell={() => false}
    />
  );
}

export default WeekPanel;

import { isInRange } from '../utils/dateUtil';
import { GenerateConfig } from '../generate';
import { RangeValue, NullableDateType } from '../interface';
import { getValue } from '../utils/miscUtil';

export default function useCellClassName<DateType>({
  cellPrefixCls,
  generateConfig,
  rangedValue,
  hoverRangedValue,
  isInView,
  isSameCell,
  offsetCell,
  today,
  value,
}: {
  cellPrefixCls: string;
  generateConfig: GenerateConfig<DateType>;
  isSameCell: (
    current: NullableDateType<DateType>,
    target: NullableDateType<DateType>,
  ) => boolean;
  offsetCell: (date: DateType, offset: number) => DateType;
  isInView: (date: DateType) => boolean;
  rangedValue?: RangeValue<DateType>;
  hoverRangedValue?: RangeValue<DateType>;
  today?: NullableDateType<DateType>;
  value?: NullableDateType<DateType>;
}) {
  function getClassName(currentDate: DateType) {
    const prevDate = offsetCell(currentDate, -1);
    const nextDate = offsetCell(currentDate, 1);
    const isRangeHovered = isInRange(
      generateConfig,
      getValue(hoverRangedValue, 0),
      getValue(hoverRangedValue, 1),
      currentDate,
    );

    function isRangeStart(date: DateType) {
      return isSameCell(getValue(rangedValue, 0), date);
    }
    function isRangeEnd(date: DateType) {
      return isSameCell(getValue(rangedValue, 1), date);
    }
    const isHoverStart = isSameCell(getValue(hoverRangedValue, 0), currentDate);
    const isHoverEnd = isSameCell(getValue(hoverRangedValue, 1), currentDate);

    return {
      // In view
      [`${cellPrefixCls}-in-view`]: isInView(currentDate),

      // Range
      [`${cellPrefixCls}-in-range`]: isInRange<DateType>(
        generateConfig,
        getValue(rangedValue, 0),
        getValue(rangedValue, 1),
        currentDate,
      ),
      [`${cellPrefixCls}-range-start`]: isRangeStart(currentDate),
      [`${cellPrefixCls}-range-end`]: isRangeEnd(currentDate),

      // Range Hover
      [`${cellPrefixCls}-range-hover`]: isRangeHovered,
      [`${cellPrefixCls}-range-hover-start`]: isHoverStart,
      [`${cellPrefixCls}-range-hover-end`]: isHoverEnd,

      // Range Edge
      [`${cellPrefixCls}-range-hover-edge-start`]:
        (isRangeHovered || isHoverEnd) &&
        (!isInView(prevDate) || isRangeEnd(prevDate)),
      [`${cellPrefixCls}-range-hover-edge-end`]:
        (isRangeHovered || isHoverStart) &&
        (!isInView(nextDate) || isRangeStart(nextDate)),

      // Others
      [`${cellPrefixCls}-today`]: isSameCell(today, currentDate),
      [`${cellPrefixCls}-selected`]: isSameCell(value, currentDate),
    };
  }

  return getClassName;
}

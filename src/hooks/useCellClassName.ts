import { isInRange } from '../utils/dateUtil';
import { GenerateConfig } from '../generate';
import { RangeValue, NullableDateType } from '../interface';

export default function useCellClassName<DateType>({
  cellPrefixCls,
  generateConfig,
  rangedValue,
  hoverRangedValue,
  isSameCell,
  today,
  value,
}: {
  cellPrefixCls: string;
  generateConfig: GenerateConfig<DateType>;
  isSameCell: (
    current: NullableDateType<DateType>,
    target: NullableDateType<DateType>,
  ) => boolean;
  rangedValue?: RangeValue<DateType>;
  hoverRangedValue?: RangeValue<DateType>;
  today?: NullableDateType<DateType>;
  value?: NullableDateType<DateType>;
}) {
  function getClassName(currentDate: DateType) {
    return {
      [`${cellPrefixCls}-in-range`]: isInRange<DateType>(
        generateConfig,
        rangedValue && rangedValue[0],
        rangedValue && rangedValue[1],
        currentDate,
      ),
      [`${cellPrefixCls}-range-start`]: isSameCell(
        rangedValue && rangedValue[0],
        currentDate,
      ),
      [`${cellPrefixCls}-range-end`]: isSameCell(
        rangedValue && rangedValue[1],
        currentDate,
      ),
      [`${cellPrefixCls}-range-hover`]: isInRange(
        generateConfig,
        hoverRangedValue && hoverRangedValue[0],
        hoverRangedValue && hoverRangedValue[1],
        currentDate,
      ),
      [`${cellPrefixCls}-range-hover-start`]: isSameCell(
        hoverRangedValue && hoverRangedValue[0],
        currentDate,
      ),
      [`${cellPrefixCls}-range-hover-end`]: isSameCell(
        hoverRangedValue && hoverRangedValue[1],
        currentDate,
      ),
      [`${cellPrefixCls}-today`]: isSameCell(today, currentDate),
      [`${cellPrefixCls}-selected`]: isSameCell(value, currentDate),
    };
  }

  return getClassName;
}

import * as React from 'react';
import type { CellRender, CellRenderInfo, SharedPickerProps } from '../../interface';

export default function useCellRender<DateType = any>(
  cellRender: SharedPickerProps<DateType>['cellRender'],
  dateRender: SharedPickerProps<DateType>['dateRender'],
  monthCellRender: SharedPickerProps<DateType>['monthCellRender'],
  range?: CellRenderInfo<DateType>['range'],
) {
  // Merged render
  const mergedCellRender = React.useMemo(() => {
    if (cellRender) {
      return cellRender;
    }

    return (current: DateType | number, info: CellRenderInfo<DateType>) => {
      const date = current as DateType;
      if (dateRender && info.type === 'date') {
        return dateRender(date, info.today);
      }
      if (monthCellRender && info.type === 'month') {
        return monthCellRender(date, info.locale);
      }
      return info.originNode;
    };
  }, [cellRender, monthCellRender, dateRender]);

  // Cell render
  const onInternalCellRender: CellRender<DateType> = React.useCallback(
    (date, info) =>
      mergedCellRender(date, {
        ...info,
        range,
      }),
    [mergedCellRender, range],
  );

  return onInternalCellRender;
}

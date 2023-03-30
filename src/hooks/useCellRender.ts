import type { PickerPanelProps } from "@/PickerPanel";
import type { RangePickerProps } from "@/RangePicker";
import type { CellRenderInfo } from "@/interface";
import React from "react";

export function useCellRender<DateType>({
    cellRender,
    monthCellRender,
    dateRender,
}: PickerPanelProps<DateType> | RangePickerProps<DateType>) {
  const mergedCellRender = React.useMemo(() => {
    if (cellRender) return cellRender;
    if (!monthCellRender && !dateRender) return undefined;
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
  return mergedCellRender;
}

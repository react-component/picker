import * as React from 'react';
import { getWeekStartDate, isSameDate, isSameMonth } from '../../../utils/dateUtil';
import type { SharedPanelProps } from '../../interface';
import { PanelContext, useInfo } from '../context';
import PanelBody from '../PanelBody';

export default function DatePanel<DateType = any>(props: SharedPanelProps<DateType>) {
  const { prefixCls, locale, generateConfig, pickerValue, value } = props;

  // ========================== Base ==========================
  const [info, now] = useInfo(props);
  const baseDate = getWeekStartDate(locale.locale, generateConfig, pickerValue);

  // ========================= Cells ==========================
  const getCellDate = (date: DateType, offset: number) => {
    return generateConfig.addDate(date, offset);
  };

  const getCellText = (date: DateType) => {
    return generateConfig.getDate(date);
  };

  const getCellClassName = (date: DateType) => ({
    [`${prefixCls}-cell-in-view`]: isSameMonth(generateConfig, date, pickerValue),
    [`${prefixCls}-cell-today`]: isSameDate(generateConfig, date, now),
    [`${prefixCls}-cell-selected`]: isSameDate(generateConfig, date, value),
  });

  // ========================= Render =========================
  return (
    <PanelContext.Provider
      value={{
        type: 'date',
        ...info,
      }}
    >
      <PanelBody
        colNum={7}
        rowNum={6}
        baseDate={baseDate}
        // Cell
        getCellDate={getCellDate}
        getCellText={getCellText}
        getCellClassName={getCellClassName}
      />
    </PanelContext.Provider>
  );
}

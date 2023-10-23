import * as React from 'react';
import { getWeekStartDate, isSameDate, isSameMonth } from '../../../utils/dateUtil';
import { PrefixClsContext } from '../../PickerInput/context';
import { PanelContext, PanelInfoContext, type PanelInfoProps } from '../context';
import PanelBody from '../PanelBody';

export default function DatePanel<DateType = any>() {
  const prefixCls = React.useContext(PrefixClsContext);
  const { value, pickerValue, locale, generateConfig, now } = React.useContext(PanelContext);

  // ======================= Base Date ========================
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

  // ======================== Context =========================
  const infoContext = React.useMemo<PanelInfoProps>(
    () => ({
      type: 'date',
    }),
    [],
  );

  // ========================= Render =========================
  return (
    <PanelInfoContext.Provider value={infoContext}>
      <PanelBody
        colNum={7}
        rowNum={6}
        baseDate={baseDate}
        // Cell
        getCellDate={getCellDate}
        getCellText={getCellText}
        getCellClassName={getCellClassName}
      />
    </PanelInfoContext.Provider>
  );
}

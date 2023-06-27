import * as React from 'react';
import type { GenerateConfig } from '../../generate';
import useCellClassName from '../../hooks/useCellClassName';
import type { CellRender, Locale } from '../../interface';
import RangeContext from '../../RangeContext';
import { formatValue, isSameMonth } from '../../utils/dateUtil';
import PanelBody from '../PanelBody';

export const MONTH_COL_COUNT = 3;
const MONTH_ROW_COUNT = 4;

export type MonthCellRender<DateType> = (currentDate: DateType, locale: Locale) => React.ReactNode;

export type MonthBodyProps<DateType> = {
  prefixCls: string;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;
  value?: DateType | null;
  viewDate: DateType;
  disabledDate?: (date: DateType) => boolean;
  cellRender?: CellRender<DateType>;
  onSelect: (value: DateType) => void;
};

function MonthBody<DateType>(props: MonthBodyProps<DateType>) {
  const { prefixCls, locale, value, viewDate, generateConfig, cellRender } = props;

  const { rangedValue, hoverRangedValue } = React.useContext(RangeContext);

  const cellPrefixCls = `${prefixCls}-cell`;

  const getCellClassName = useCellClassName({
    cellPrefixCls,
    value,
    generateConfig,
    rangedValue,
    hoverRangedValue,
    isSameCell: (current, target) => isSameMonth(generateConfig, current, target),
    isInView: () => true,
    offsetCell: (date, offset) => generateConfig.addMonth(date, offset),
  });

  const monthsLocale: string[] =
    locale.shortMonths ||
    (generateConfig.locale.getShortMonths
      ? generateConfig.locale.getShortMonths(locale.locale)
      : []);

  const baseMonth = generateConfig.setMonth(viewDate, 0);

  const getCellNode = cellRender
    ? (date: DateType, wrapperNode: React.ReactElement) =>
        cellRender(date, {
          originNode: wrapperNode,
          locale,
          today: generateConfig.getNow(),
          type: 'month',
        })
    : undefined;

  return (
    <PanelBody
      {...props}
      rowNum={MONTH_ROW_COUNT}
      colNum={MONTH_COL_COUNT}
      baseDate={baseMonth}
      getCellNode={getCellNode}
      getCellText={(date) =>
        locale.monthFormat
          ? formatValue(date, {
              locale,
              format: locale.monthFormat,
              generateConfig,
            })
          : monthsLocale[generateConfig.getMonth(date)]
      }
      getCellClassName={getCellClassName}
      getCellDate={generateConfig.addMonth}
      titleCell={(date) =>
        formatValue(date, {
          locale,
          format: 'YYYY-MM',
          generateConfig,
        })
      }
    />
  );
}

export default MonthBody;

import * as React from 'react';
import classNames from 'classnames';
import { GenerateConfig } from '../../generate';
import { YEAR_DECADE_COUNT } from '.';
import { Locale, NullableDateType } from '../../interface';
import PanelContext from '../../PanelContext';
import useCellClassName from '../../hooks/useCellClassName';
import { isSameYear } from '../../utils/dateUtil';
import RangeContext from '../../RangeContext';

export const YEAR_COL_COUNT = 3;
const YEAR_ROW_COUNT = 4;

export interface YearBodyProps<DateType> {
  prefixCls: string;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;
  value?: NullableDateType<DateType>;
  viewDate: DateType;
  disabledDate?: (date: DateType) => boolean;
  onSelect: (value: DateType) => void;
}

function YearBody<DateType>({
  prefixCls,
  value,
  viewDate,
  locale,
  generateConfig,
  disabledDate,
  onSelect,
}: YearBodyProps<DateType>) {
  const { rangedValue, hoverRangedValue } = React.useContext(RangeContext);
  const { onDateMouseEnter, onDateMouseLeave } = React.useContext(PanelContext);

  const yearPrefixCls = `${prefixCls}-cell`;

  // =============================== Year ===============================
  const yearNumber = generateConfig.getYear(viewDate);
  const startYear =
    Math.floor(yearNumber / YEAR_DECADE_COUNT) * YEAR_DECADE_COUNT;
  const endYear = startYear + YEAR_DECADE_COUNT - 1;
  const baseYear = generateConfig.setYear(
    viewDate,
    startYear -
      Math.ceil((YEAR_COL_COUNT * YEAR_ROW_COUNT - YEAR_DECADE_COUNT) / 2),
  );

  const rows: React.ReactNode[] = [];
  const getCellClassName = useCellClassName<DateType>({
    cellPrefixCls: yearPrefixCls,
    value,
    generateConfig,
    rangedValue,
    hoverRangedValue,
    isSameCell: (current, target) =>
      isSameYear(generateConfig, current, target),
    isInView: date => {
      const currentYearNumber = generateConfig.getYear(date);
      return startYear <= currentYearNumber && currentYearNumber <= endYear;
    },
    offsetCell: (date, offset) => generateConfig.addYear(date, offset),
  });

  for (let i = 0; i < YEAR_ROW_COUNT; i += 1) {
    const row: React.ReactNode[] = [];

    for (let j = 0; j < YEAR_COL_COUNT; j += 1) {
      const diffYear = i * YEAR_COL_COUNT + j;
      const yearDate = generateConfig.addYear(baseYear, diffYear);
      const currentYearNumber = generateConfig.getYear(yearDate);
      const disabled = disabledDate && disabledDate(yearDate);

      row.push(
        <td
          key={j}
          title={generateConfig.locale.format(locale.locale, yearDate, 'YYYY')}
          className={classNames(yearPrefixCls, {
            [`${yearPrefixCls}-disabled`]: disabled,
            ...getCellClassName(yearDate),
          })}
          onClick={() => {
            if (!disabled) {
              onSelect(yearDate);
            }
          }}
          onMouseEnter={() => {
            if (!disabled && onDateMouseEnter) {
              onDateMouseEnter(yearDate);
            }
          }}
          onMouseLeave={() => {
            if (!disabled && onDateMouseLeave) {
              onDateMouseLeave(yearDate);
            }
          }}
        >
          <div className={`${yearPrefixCls}-inner`}>{currentYearNumber}</div>
        </td>,
      );
    }

    rows.push(<tr key={i}>{row}</tr>);
  }

  return (
    <div className={`${prefixCls}-body`}>
      <table className={`${prefixCls}-content`}>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export default YearBody;

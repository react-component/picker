import * as React from 'react';
import classNames from 'classnames';
import { GenerateConfig } from '../../generate';
import { YEAR_DECADE_COUNT } from '.';
import { Locale, NullableDateType } from '../../interface';
import PanelContext from '../../PanelContext';

export const YEAR_COL_COUNT = 3;
const YEAR_ROW_COUNT = 4;

export interface YearBodyProps<DateType> {
  prefixCls: string;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;
  value: NullableDateType<DateType>;
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
  const { onDateMouseEnter, onDateMouseLeave } = React.useContext(PanelContext);

  const yearPrefixCls = `${prefixCls}-cell`;
  const rows: React.ReactNode[] = [];

  const valueYearNumber = value ? generateConfig.getYear(value) : null;
  const yearNumber = generateConfig.getYear(viewDate);
  const startYear =
    Math.floor(yearNumber / YEAR_DECADE_COUNT) * YEAR_DECADE_COUNT;
  const endYear = startYear + YEAR_DECADE_COUNT - 1;
  const baseYear = generateConfig.setYear(
    viewDate,
    startYear -
      Math.ceil((YEAR_COL_COUNT * YEAR_ROW_COUNT - YEAR_DECADE_COUNT) / 2),
  );

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
            [`${yearPrefixCls}-in-view`]:
              startYear <= currentYearNumber && currentYearNumber <= endYear,
            [`${yearPrefixCls}-selected`]:
              currentYearNumber === valueYearNumber,
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

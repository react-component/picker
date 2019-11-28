import * as React from 'react';
import classNames from 'classnames';
import { GenerateConfig } from '../../generate';
import { DECADE_DISTANCE_COUNT, DECADE_UNIT_DIFF } from '.';

export const DECADE_COL_COUNT = 3;
const DECADE_ROW_COUNT = 4;

export interface YearBodyProps<DateType> {
  prefixCls: string;
  generateConfig: GenerateConfig<DateType>;
  viewDate: DateType;
  disabledDate?: (date: DateType) => boolean;
  onSelect: (value: DateType) => void;
}

function DecadeBody<DateType>({
  prefixCls,
  viewDate,
  generateConfig,
  disabledDate,
  onSelect,
}: YearBodyProps<DateType>) {
  const yearPrefixCls = `${prefixCls}-cell`;
  const rows: React.ReactNode[] = [];

  const yearNumber = generateConfig.getYear(viewDate);
  const decadeYearNumber =
    Math.floor(yearNumber / DECADE_UNIT_DIFF) * DECADE_UNIT_DIFF;

  const startDecadeYear =
    Math.floor(yearNumber / DECADE_DISTANCE_COUNT) * DECADE_DISTANCE_COUNT;
  const endDecadeYear = startDecadeYear + DECADE_DISTANCE_COUNT - 1;

  const baseDecadeYear =
    startDecadeYear -
    Math.ceil(
      (DECADE_COL_COUNT * DECADE_ROW_COUNT * DECADE_UNIT_DIFF -
        DECADE_DISTANCE_COUNT) /
        2,
    );

  for (let i = 0; i < DECADE_ROW_COUNT; i += 1) {
    const row: React.ReactNode[] = [];

    for (let j = 0; j < DECADE_COL_COUNT; j += 1) {
      const diffDecade = (i * DECADE_COL_COUNT + j) * DECADE_UNIT_DIFF;
      const startDecadeNumber = baseDecadeYear + diffDecade;
      const endDecadeNumber = baseDecadeYear + diffDecade + 9;
      const cellDate = generateConfig.setYear(viewDate, startDecadeNumber);
      const disabled = disabledDate && disabledDate(cellDate);

      row.push(
        <td
          key={j}
          className={classNames(yearPrefixCls, {
            [`${yearPrefixCls}-disabled`]: disabled,
            [`${yearPrefixCls}-in-view`]:
              startDecadeYear <= startDecadeNumber &&
              endDecadeNumber <= endDecadeYear,
            [`${yearPrefixCls}-selected`]:
              startDecadeNumber === decadeYearNumber,
          })}
          onClick={() => {
            if (disabled) {
              return;
            }
            onSelect(cellDate);
          }}
        >
          <div className={`${yearPrefixCls}-inner`}>
            {startDecadeNumber}-{endDecadeNumber}
          </div>
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

export default DecadeBody;

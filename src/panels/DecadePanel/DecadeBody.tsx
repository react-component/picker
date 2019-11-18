import * as React from 'react';
import classNames from 'classnames';
import { GenerateConfig } from '../../utils/generateUtil';
import { DECADE_DISTANCE_COUNT } from '.';

const DECADE_COL_COUNT = 3;
const DECADE_ROW_COUNT = 4;

export interface YearBodyProps<DateType> {
  prefixCls: string;
  generateConfig: GenerateConfig<DateType>;
  viewDate: DateType;
  onSelect: (value: DateType) => void;
}

function YearBody<DateType>({
  prefixCls,
  viewDate,
  generateConfig,
  onSelect,
}: YearBodyProps<DateType>) {
  const yearPrefixCls = `${prefixCls}-cell`;
  const rows: React.ReactNode[] = [];

  const yearNumber = generateConfig.getYear(viewDate);
  const decadeYearNumber = Math.floor(yearNumber / 10) * 10;

  const startDecadeYear =
    Math.floor(yearNumber / DECADE_DISTANCE_COUNT) * DECADE_DISTANCE_COUNT;
  const endDecadeYear = startDecadeYear + DECADE_DISTANCE_COUNT - 1;

  const baseDecadeYear =
    startDecadeYear -
    Math.ceil(
      (DECADE_COL_COUNT * DECADE_ROW_COUNT * 10 - DECADE_DISTANCE_COUNT) / 2,
    );

  for (let i = 0; i < DECADE_ROW_COUNT; i += 1) {
    const row: React.ReactNode[] = [];

    for (let j = 0; j < DECADE_COL_COUNT; j += 1) {
      const diffDecade = (i * DECADE_COL_COUNT + j) * 10;
      const startDecadeNumber = baseDecadeYear + diffDecade;
      const endDecadeNumber = baseDecadeYear + diffDecade + 9;

      row.push(
        <td
          key={j}
          className={classNames(yearPrefixCls, {
            [`${yearPrefixCls}-in-view`]:
              startDecadeYear <= startDecadeNumber &&
              endDecadeNumber <= endDecadeYear,
            [`${yearPrefixCls}-selected`]:
              startDecadeNumber === decadeYearNumber,
          })}
        >
          <button
            type="button"
            className={`${yearPrefixCls}-cell`}
            onClick={() => {
              onSelect(generateConfig.setYear(viewDate, startDecadeYear));
            }}
          >
            {startDecadeNumber}-{endDecadeNumber}
          </button>
        </td>,
      );
    }

    rows.push(<tr key={i}>{row}</tr>);
  }

  return (
    <table>
      <tbody>{rows}</tbody>
    </table>
  );
}

export default YearBody;

import * as React from 'react';
import classNames from 'classnames';
import { GenerateConfig } from '../../utils/generateUtil';
import {
  WEEK_DAY_COUNT,
  getWeekStartDate,
  isSameDate,
  isSameMonth,
} from '../../utils/dateUtil';
import { Locale } from '../../interface';

export interface DateBodyProps<DateType> {
  prefixCls: string;
  generateConfig: GenerateConfig<DateType>;
  value: DateType;
  viewDate: DateType;
  locale: Locale;
  rowCount: number;
  onSelect: (value: DateType) => void;

  // Used for week panel
  prefixColumn?: () => React.ReactNode;
}

function DateBody<DateType>({
  prefixCls,
  generateConfig,
  prefixColumn,
  locale,
  rowCount,
  viewDate,
  value,
  onSelect,
}: DateBodyProps<DateType>) {
  const datePrefixCls = `${prefixCls}-cell`;
  const weekFirstDay = generateConfig.locale.getWeekFirstDay(locale.locale);
  const today = generateConfig.getNow();

  // ============================== Header ==============================
  const headerCells: React.ReactNode[] = [];
  const weekDaysLocale: string[] =
    locale.shortWeekDays ||
    (generateConfig.locale.getShortWeekDays
      ? generateConfig.locale.getShortWeekDays(locale.locale)
      : []);

  for (let i = 0; i < WEEK_DAY_COUNT; i += 1) {
    headerCells.push(
      <th key={i}>{weekDaysLocale[(i + weekFirstDay) % WEEK_DAY_COUNT]}</th>,
    );
  }

  // =============================== Date ===============================
  const rows: React.ReactNode[] = [];
  const startDate = getWeekStartDate(locale.locale, generateConfig, viewDate);

  for (let y = 0; y < rowCount; y += 1) {
    const row: React.ReactNode[] = [];
    if (prefixColumn) {
      row.push(prefixColumn());
    }

    for (let x = 0; x < WEEK_DAY_COUNT; x += 1) {
      const currentDate = generateConfig.addDate(
        startDate,
        y * WEEK_DAY_COUNT + x,
      );
      row.push(
        <td
          key={`${x}-${y}`}
          className={classNames(datePrefixCls, {
            [`${datePrefixCls}-in-view`]: isSameMonth(
              generateConfig,
              currentDate,
              viewDate,
            ),
            [`${datePrefixCls}-today`]: isSameDate(
              generateConfig,
              today,
              currentDate,
            ),
            [`${datePrefixCls}-selected`]: isSameDate(
              generateConfig,
              value,
              currentDate,
            ),
          })}
        >
          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              onSelect(currentDate);
            }}
          >
            {generateConfig.getDate(currentDate)}
          </button>
        </td>,
      );
    }

    rows.push(<tr key={y}>{row}</tr>);
  }

  return (
    <table className={`${prefixCls}-content`}>
      <thead>
        <tr>{headerCells}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

export default DateBody;

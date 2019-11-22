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

export interface DateBodyPassProps<DateType> {
  // Used for week panel
  prefixColumn?: (date: DateType) => React.ReactNode;
  rowClassName?: (date: DateType) => string;
}

export interface DateBodyProps<DateType> extends DateBodyPassProps<DateType> {
  prefixCls: string;
  generateConfig: GenerateConfig<DateType>;
  value: DateType;
  viewDate: DateType;
  locale: Locale;
  rowCount: number;
  onSelect: (value: DateType) => void;
}

function DateBody<DateType>({
  prefixCls,
  generateConfig,
  prefixColumn,
  rowClassName,
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

  if (prefixColumn) {
    headerCells.push(<th key="empty" />);
  }
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
    const startWeekDate = generateConfig.addDate(startDate, y * WEEK_DAY_COUNT);

    if (prefixColumn) {
      row.push(prefixColumn(startWeekDate));
    }

    for (let x = 0; x < WEEK_DAY_COUNT; x += 1) {
      const currentDate = generateConfig.addDate(startWeekDate, x);
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

    rows.push(
      <tr
        key={y}
        className={classNames(rowClassName && rowClassName(startWeekDate))}
      >
        {row}
      </tr>,
    );
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

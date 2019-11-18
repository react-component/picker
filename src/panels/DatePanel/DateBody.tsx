import * as React from 'react';
import classNames from 'classnames';
import { GenerateConfig } from '../../generate';
import { WEEK_DAY_COUNT, getVisibleDates } from '../../utils/dateUtil';
import { Locale } from '../../interface';

export interface DateBodyProps<DateType> {
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
  locale,
  rowCount,
  viewDate,
  value,
  onSelect,
}: DateBodyProps<DateType>) {
  const datePrefixCls = `${prefixCls}-date`;
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
  const dateList = getVisibleDates(
    locale.locale,
    generateConfig,
    rowCount,
    viewDate,
  );

  const rows: React.ReactNode[] = [];
  let row: React.ReactNode[] = [];
  dateList.forEach(({ date, currentMonth }, index) => {
    row.push(
      <td
        key={index}
        className={classNames(datePrefixCls, {
          [`${datePrefixCls}-current`]: currentMonth,
          [`${datePrefixCls}-today`]: generateConfig.isSameDate(today, date),
          [`${datePrefixCls}-now`]: generateConfig.isSameDate(value, date),
        })}
      >
        <button
          type="button"
          className={`${datePrefixCls}-cell`}
          onClick={() => {
            onSelect(date);
          }}
        >
          {generateConfig.getDate(date)}
        </button>
      </td>,
    );

    if (row.length === WEEK_DAY_COUNT) {
      rows.push(<tr key={rows.length}>{row}</tr>);
      row = [];
    }
  });

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

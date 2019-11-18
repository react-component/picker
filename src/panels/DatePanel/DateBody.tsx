import * as React from 'react';
import classNames from 'classnames';
import { GenerateConfig } from '../../generate';
import { WEEK_DAY_COUNT, getVisibleDates } from '../../utils/dateUtil';

export interface DateBodyProps<DateType> {
  prefixCls: string;
  generateConfig: GenerateConfig<DateType>;
  value: DateType;
  locale: string;
  rowCount: number;
}

function DateBody<DateType>({
  prefixCls,
  generateConfig,
  locale,
  rowCount,
  value,
}: DateBodyProps<DateType>) {
  const datePrefixCls = `${prefixCls}-date`;
  const weekFirstDay = generateConfig.locale.getWeekFirstDay(locale);

  // ============================== Header ==============================
  const headerCells: React.ReactNode[] = [];
  const weekDaysLocale: string[] = generateConfig.locale.getWeekDays(locale);

  for (let i = 0; i < WEEK_DAY_COUNT; i += 1) {
    headerCells.push(
      <th key={i}>{weekDaysLocale[(i + weekFirstDay) % WEEK_DAY_COUNT]}</th>,
    );
  }

  // =============================== Date ===============================
  const dateList = getVisibleDates(locale, generateConfig, rowCount, value);

  const rows: React.ReactNode[] = [];
  let row: React.ReactNode[] = [];
  dateList.forEach(({ date, currentMonth }, index) => {
    row.push(
      <td
        key={index}
        className={classNames(datePrefixCls, {
          [`${datePrefixCls}-current`]: currentMonth,
        })}
      >
        {generateConfig.getDate(date)}
      </td>,
    );

    if (row.length === WEEK_DAY_COUNT) {
      rows.push(<tr>{row}</tr>);
      row = [];
    }
  });

  return (
    <table>
      <thead>
        <tr>{headerCells}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

export default DateBody;

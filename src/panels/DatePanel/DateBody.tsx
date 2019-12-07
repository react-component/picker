import * as React from 'react';
import classNames from 'classnames';
import { GenerateConfig } from '../../generate';
import {
  WEEK_DAY_COUNT,
  getWeekStartDate,
  isSameDate,
  isSameMonth,
} from '../../utils/dateUtil';
import { Locale, OnSelect } from '../../interface';
import RangeContext from '../../RangeContext';
import PanelContext from '../../PanelContext';
import useCellClassName from '../../hooks/useCellClassName';

export type DateRender<DateType> = (
  currentDate: DateType,
  today: DateType,
) => React.ReactNode;

export interface DateBodyPassProps<DateType> {
  dateRender?: DateRender<DateType>;
  disabledDate?: (date: DateType) => boolean;

  // Used for week panel
  prefixColumn?: (date: DateType) => React.ReactNode;
  rowClassName?: (date: DateType) => string;
}

export interface DateBodyProps<DateType> extends DateBodyPassProps<DateType> {
  prefixCls: string;
  generateConfig: GenerateConfig<DateType>;
  value?: DateType | null;
  viewDate: DateType;
  locale: Locale;
  rowCount: number;
  onSelect: OnSelect<DateType>;
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
  disabledDate,
  dateRender,
  onSelect,
}: DateBodyProps<DateType>) {
  const { rangedValue, hoverRangedValue } = React.useContext(RangeContext);
  const { onDateMouseEnter, onDateMouseLeave } = React.useContext(PanelContext);

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
  const getCellClassName = useCellClassName({
    cellPrefixCls: datePrefixCls,
    today,
    value,
    generateConfig,
    rangedValue: prefixColumn ? null : rangedValue,
    hoverRangedValue: prefixColumn ? null : hoverRangedValue,
    isSameCell: (current, target) =>
      isSameDate(generateConfig, current, target),
    isInView: date => isSameMonth(generateConfig, date, viewDate),
    offsetCell: (date, offset) => generateConfig.addDate(date, offset),
  });

  for (let y = 0; y < rowCount; y += 1) {
    const row: React.ReactNode[] = [];
    const startWeekDate = generateConfig.addDate(startDate, y * WEEK_DAY_COUNT);

    if (prefixColumn) {
      row.push(prefixColumn(startWeekDate));
    }

    for (let x = 0; x < WEEK_DAY_COUNT; x += 1) {
      const currentDate = generateConfig.addDate(startWeekDate, x);
      const disabled = disabledDate && disabledDate(currentDate);
      row.push(
        <td
          key={`${x}-${y}`}
          title={generateConfig.locale.format(
            locale.locale,
            currentDate,
            'YYYY-MM-DD',
          )}
          onClick={() => {
            if (!disabled) {
              onSelect(currentDate, 'mouse');
            }
          }}
          onMouseEnter={() => {
            if (!disabled && onDateMouseEnter) {
              onDateMouseEnter(currentDate);
            }
          }}
          onMouseLeave={() => {
            if (!disabled && onDateMouseLeave) {
              onDateMouseLeave(currentDate);
            }
          }}
          className={classNames(datePrefixCls, {
            [`${datePrefixCls}-disabled`]: disabled,

            ...getCellClassName(currentDate),
          })}
        >
          {dateRender ? (
            dateRender(currentDate, today)
          ) : (
            <div className={`${datePrefixCls}-inner`}>
              {generateConfig.getDate(currentDate)}
            </div>
          )}
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
    <div className={`${prefixCls}-body`}>
      <table className={`${prefixCls}-content`}>
        <thead>
          <tr>{headerCells}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export default DateBody;

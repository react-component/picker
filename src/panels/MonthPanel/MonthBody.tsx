import * as React from 'react';
import classNames from 'classnames';
import { GenerateConfig } from '../../generate';
import { Locale } from '../../interface';
import { isSameMonth } from '../../utils/dateUtil';
import PanelContext from '../../PanelContext';

export const MONTH_COL_COUNT = 3;
const MONTH_ROW_COUNT = 4;

export type MonthCellRender<DateType> = (
  currentDate: DateType,
  locale: Locale,
) => React.ReactNode;

export interface MonthBodyProps<DateType> {
  prefixCls: string;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;
  value?: DateType | null;
  viewDate: DateType;
  disabledDate?: (date: DateType) => boolean;
  monthCellRender?: MonthCellRender<DateType>;
  onSelect: (value: DateType) => void;
}

function MonthBody<DateType>({
  prefixCls,
  locale,
  value,
  viewDate,
  generateConfig,
  disabledDate,
  monthCellRender,
  onSelect,
}: MonthBodyProps<DateType>) {
  const { onDateMouseEnter, onDateMouseLeave } = React.useContext(PanelContext);

  const monthPrefixCls = `${prefixCls}-cell`;
  const rows: React.ReactNode[] = [];

  const monthsLocale: string[] =
    locale.shortMonths ||
    (generateConfig.locale.getShortMonths
      ? generateConfig.locale.getShortMonths(locale.locale)
      : []);

  const startMonth = generateConfig.setMonth(viewDate, 0);

  for (let i = 0; i < MONTH_ROW_COUNT; i += 1) {
    const row: React.ReactNode[] = [];

    for (let j = 0; j < MONTH_COL_COUNT; j += 1) {
      const diffMonth = i * MONTH_COL_COUNT + j;
      const monthDate = generateConfig.addMonth(startMonth, diffMonth);
      const disabled = disabledDate && disabledDate(monthDate);

      row.push(
        <td
          key={j}
          title={generateConfig.locale.format(
            locale.locale,
            monthDate,
            'YYYY-MM',
          )}
          className={classNames(monthPrefixCls, {
            [`${monthPrefixCls}-disabled`]: disabled,
            [`${monthPrefixCls}-in-view`]: true,
            [`${monthPrefixCls}-selected`]: isSameMonth(
              generateConfig,
              value,
              monthDate,
            ),
          })}
          onClick={() => {
            if (!disabled) {
              onSelect(monthDate);
            }
          }}
          onMouseEnter={() => {
            if (!disabled && onDateMouseEnter) {
              onDateMouseEnter(monthDate);
            }
          }}
          onMouseLeave={() => {
            if (!disabled && onDateMouseLeave) {
              onDateMouseLeave(monthDate);
            }
          }}
        >
          {monthCellRender ? (
            monthCellRender(monthDate, locale)
          ) : (
            <div className={`${monthPrefixCls}-inner`}>
              {locale.monthFormat
                ? generateConfig.locale.format(
                    locale.locale,
                    monthDate,
                    locale.monthFormat,
                  )
                : monthsLocale[diffMonth]}
            </div>
          )}
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

export default MonthBody;

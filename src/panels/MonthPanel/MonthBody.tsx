import * as React from 'react';
import { GenerateConfig } from '../../generate';
import { Locale } from '../../interface';

const MONTH_COL_COUNT = 3;
const MONTH_ROW_COUNT = 4;

export interface MonthBodyProps<DateType> {
  prefixCls: string;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;
  viewDate: DateType;
  onSelect: (value: DateType) => void;
}

function MonthBody<DateType>({
  prefixCls,
  locale,
  viewDate,
  generateConfig,
  onSelect,
}: MonthBodyProps<DateType>) {
  const monthPrefixCls = `${prefixCls}-month`;
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

      row.push(
        <td key={j}>
          <button
            type="button"
            className={`${monthPrefixCls}-cell`}
            onClick={() => {
              onSelect(monthDate);
            }}
          >
            {locale.monthFormat
              ? generateConfig.locale.format(
                  locale.locale,
                  monthDate,
                  locale.monthFormat,
                )
              : monthsLocale[diffMonth]}
          </button>
        </td>,
      );
    }

    rows.push(<tr key={i}>{row}</tr>);
  }

  return <table>{rows}</table>;
}

export default MonthBody;

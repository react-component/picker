import * as React from 'react';
import Header from '../Header';
import { Locale } from '../../interface';
import { GenerateConfig } from '../../generate';

export interface DateHeaderProps<DateType> {
  prefixCls: string;
  viewDate: DateType;
  value: DateType;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;

  onPrevYear: () => void;
  onNextYear: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onYearClick: () => void;
  onMonthClick: () => void;
}

function DateHeader<DateType>(props: DateHeaderProps<DateType>) {
  const {
    prefixCls,
    generateConfig,
    locale,
    viewDate,
    onNextMonth,
    onPrevMonth,
    onNextYear,
    onPrevYear,
    onYearClick,
    onMonthClick,
  } = props;
  const headerPrefixCls = `${prefixCls}-header`;

  const monthsLocale: string[] =
    locale.shortMonths ||
    (generateConfig.locale.getShortMonths
      ? generateConfig.locale.getShortMonths(locale.locale)
      : []);

  const month = generateConfig.getMonth(viewDate);

  // =================== Month & Year ===================
  const yearNode: React.ReactNode = (
    <button type="button" key="year" onClick={onYearClick} tabIndex={-1}>
      {generateConfig.locale.format(locale.locale, viewDate, locale.yearFormat)}
    </button>
  );
  const monthNode: React.ReactNode = (
    <button type="button" key="month" onClick={onMonthClick} tabIndex={-1}>
      {locale.monthFormat
        ? generateConfig.locale.format(
            locale.locale,
            viewDate,
            locale.monthFormat,
          )
        : monthsLocale[month]}
    </button>
  );

  const monthYearNodes = locale.monthBeforeYear
    ? [monthNode, yearNode]
    : [yearNode, monthNode];

  return (
    <Header
      prefixCls={headerPrefixCls}
      onSuperPrev={onPrevYear}
      onPrev={onPrevMonth}
      onNext={onNextMonth}
      onSuperNext={onNextYear}
    >
      {monthYearNodes}
    </Header>
  );
}

export default DateHeader;

import * as React from 'react';
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
  } = props;
  const headerPrefixCls = `${prefixCls}-header`;

  const monthsLocale: string[] =
    locale.shortMonths ||
    (generateConfig.locale.getShortMonths
      ? generateConfig.locale.getShortMonths(locale.locale)
      : []);

  const month = generateConfig.getMonth(viewDate);

  // =================== Month & Year ===================
  const yearNode: React.ReactNode = generateConfig.locale.format(
    locale.locale,
    viewDate,
    locale.yearFormat,
  );
  const monthNode: React.ReactNode = locale.monthFormat
    ? generateConfig.locale.format(locale.locale, viewDate, locale.monthFormat)
    : monthsLocale[month];

  const monthYearNodes = locale.monthBeforeYear
    ? [monthNode, yearNode]
    : [yearNode, monthNode];

  return (
    <div className={headerPrefixCls}>
      <button type="button" onClick={onPrevYear}>
        {'\u00AB'}
      </button>
      <button type="button" onClick={onPrevMonth}>
        {'\u2039'}
      </button>
      <div className={`${headerPrefixCls}-month-year`}>{monthYearNodes}</div>
      <button type="button" onClick={onNextMonth}>
        {'\u203A'}
      </button>
      <button type="button" onClick={onNextYear}>
        {'\u00BB'}
      </button>
    </div>
  );
}

export default DateHeader;

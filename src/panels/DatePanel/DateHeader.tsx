import * as React from 'react';
import Header from '../Header';
import type { Locale } from '../../interface';
import type { GenerateConfig } from '../../generate';
import PanelContext from '../../PanelContext';
import { formatValue } from '../../utils/dateUtil';

export type DateHeaderProps<DateType> = {
  prefixCls: string;
  viewDate: DateType;
  value?: DateType | null;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;

  onPrevYear: () => void;
  onNextYear: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onYearClick: () => void;
  onMonthClick: () => void;
};

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

  const { hideHeader } = React.useContext(PanelContext);
  if (hideHeader) {
    return null;
  }

  const headerPrefixCls = `${prefixCls}-header`;

  const monthsLocale: string[] =
    locale.shortMonths ||
    (generateConfig.locale.getShortMonths
      ? generateConfig.locale.getShortMonths(locale.locale)
      : []);

  const month = generateConfig.getMonth(viewDate);

  // =================== Month & Year ===================
  const yearNode: React.ReactNode = (
    <button
      type="button"
      key="year"
      onClick={onYearClick}
      tabIndex={-1}
      className={`${prefixCls}-year-btn`}
    >
      {formatValue(viewDate, {
        locale,
        format: locale.yearFormat,
        generateConfig,
      })}
    </button>
  );
  const monthNode: React.ReactNode = (
    <button
      type="button"
      key="month"
      onClick={onMonthClick}
      tabIndex={-1}
      className={`${prefixCls}-month-btn`}
    >
      {locale.monthFormat
        ? formatValue(viewDate, {
            locale,
            format: locale.monthFormat,
            generateConfig,
          })
        : monthsLocale[month]}
    </button>
  );

  const monthYearNodes = locale.monthBeforeYear ? [monthNode, yearNode] : [yearNode, monthNode];

  return (
    <Header
      {...props}
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

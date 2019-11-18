import * as React from 'react';
import Header from '../Header';
import { Locale } from '../../interface';
import { GenerateConfig } from '../../utils/generateUtil';

export interface MonthHeaderProps<DateType> {
  prefixCls: string;
  viewDate: DateType;
  value: DateType;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;

  onPrevYear: () => void;
  onNextYear: () => void;
  onYearClick: () => void;
}

function MonthHeader<DateType>(props: MonthHeaderProps<DateType>) {
  const {
    prefixCls,
    generateConfig,
    locale,
    viewDate,
    onNextYear,
    onPrevYear,
    onYearClick,
  } = props;
  const headerPrefixCls = `${prefixCls}-header`;

  return (
    <Header
      prefixCls={headerPrefixCls}
      onSuperPrev={onPrevYear}
      onSuperNext={onNextYear}
    >
      <button type="button" key="year" onClick={onYearClick}>
        {generateConfig.locale.format(
          locale.locale,
          viewDate,
          locale.yearFormat,
        )}
      </button>
    </Header>
  );
}

export default MonthHeader;

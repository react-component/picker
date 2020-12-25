import * as React from 'react';
import Header from '../Header';
import type { Locale } from '../../interface';
import type { GenerateConfig } from '../../generate';
import PanelContext from '../../PanelContext';
import { formatValue } from '../../utils/dateUtil';

export type MonthHeaderProps<DateType> = {
  prefixCls: string;
  viewDate: DateType;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;

  onPrevYear: () => void;
  onNextYear: () => void;
  onYearClick: () => void;
};

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
  const { hideHeader } = React.useContext(PanelContext);
  if (hideHeader) {
    return null;
  }

  const headerPrefixCls = `${prefixCls}-header`;

  return (
    <Header
      {...props}
      prefixCls={headerPrefixCls}
      onSuperPrev={onPrevYear}
      onSuperNext={onNextYear}
    >
      <button type="button" onClick={onYearClick} className={`${prefixCls}-year-btn`}>
        {formatValue(viewDate, {
          locale,
          format: locale.yearFormat,
          generateConfig,
        })}
      </button>
    </Header>
  );
}

export default MonthHeader;

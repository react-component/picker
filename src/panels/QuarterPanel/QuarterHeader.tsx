import * as React from 'react';
import Header from '../Header';
import { Locale } from '../../interface';
import { GenerateConfig } from '../../generate';
import PanelContext from '../../PanelContext';

export interface QuarterHeaderProps<DateType> {
  prefixCls: string;
  viewDate: DateType;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;

  onPrevYear: () => void;
  onNextYear: () => void;
  onYearClick: () => void;
}

function QuarterHeader<DateType>(props: QuarterHeaderProps<DateType>) {
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
        {generateConfig.locale.format(locale.locale, viewDate, locale.yearFormat)}
      </button>
    </Header>
  );
}

export default QuarterHeader;

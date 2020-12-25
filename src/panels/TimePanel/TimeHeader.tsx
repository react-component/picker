import * as React from 'react';
import Header from '../Header';
import type { Locale } from '../../interface';
import type { GenerateConfig } from '../../generate';
import PanelContext from '../../PanelContext';
import { formatValue } from '../../utils/dateUtil';

export type TimeHeaderProps<DateType> = {
  prefixCls: string;
  value?: DateType | null;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;
  format: string;
};

function TimeHeader<DateType>(props: TimeHeaderProps<DateType>) {
  const { hideHeader } = React.useContext(PanelContext);
  if (hideHeader) {
    return null;
  }

  const { prefixCls, generateConfig, locale, value, format } = props;
  const headerPrefixCls = `${prefixCls}-header`;

  return (
    <Header prefixCls={headerPrefixCls}>
      {value
        ? formatValue(value, {
            locale,
            format,
            generateConfig,
          })
        : '\u00A0'}
    </Header>
  );
}

export default TimeHeader;

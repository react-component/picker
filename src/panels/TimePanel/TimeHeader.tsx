import * as React from 'react';
import Header from '../Header';
import { Locale } from '../../interface';
import { GenerateConfig } from '../../generate';

export interface TimeHeaderProps<DateType> {
  prefixCls: string;
  value?: DateType | null;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;
  format: string;
}

function TimeHeader<DateType>(props: TimeHeaderProps<DateType>) {
  const { prefixCls, generateConfig, locale, value, format } = props;
  const headerPrefixCls = `${prefixCls}-header`;

  return (
    <Header prefixCls={headerPrefixCls}>
      {value
        ? generateConfig.locale.format(locale.locale, value, format)
        : '\u00A0'}
    </Header>
  );
}

export default TimeHeader;

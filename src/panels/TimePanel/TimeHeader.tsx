import * as React from 'react';
import Header from '../Header';
import { Locale } from '../../interface';
import { GenerateConfig } from '../../utils/generateUtil';

export interface TimeHeaderProps<DateType> {
  prefixCls: string;
  value: DateType;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;
  format: string;
}

function TimeHeader<DateType>(props: TimeHeaderProps<DateType>) {
  const { prefixCls, generateConfig, locale, value, format } = props;
  const headerPrefixCls = `${prefixCls}-header`;

  return (
    <Header prefixCls={headerPrefixCls}>
      {generateConfig.locale.format(locale.locale, value, format)}
    </Header>
  );
}

export default TimeHeader;

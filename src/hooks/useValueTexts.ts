import * as React from 'react';
import { GenerateConfig } from '../generate';
import { Locale } from '../interface';

export default function useValueTexts<DateType>(
  value: DateType | null,
  {
    formatList,
    generateConfig,
    locale,
  }: {
    formatList: string[];
    generateConfig: GenerateConfig<DateType>;
    locale: Locale;
  },
) {
  return React.useMemo<string[]>(() => {
    if (!value) {
      return [''];
    }
    return formatList.map(subFormat =>
      generateConfig.locale.format(locale.locale, value, subFormat),
    );
  }, [value]);
}

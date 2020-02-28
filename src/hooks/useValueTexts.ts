import * as React from 'react';
import { GenerateConfig } from '../generate';
import { Locale } from '../interface';

interface ValueTextConfig<DateType> {
  formatList: string[];
  generateConfig: GenerateConfig<DateType>;
  locale: Locale;
}

export default function useValueTexts<DateType>(
  value: DateType | null,
  { formatList, generateConfig, locale }: ValueTextConfig<DateType>,
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

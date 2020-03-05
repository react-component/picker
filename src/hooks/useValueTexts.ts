import shallowEqual from 'shallowequal';
import useMemo from 'rc-util/lib/hooks/useMemo';
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
  return useMemo<string[]>(
    () => {
      if (!value) {
        return [''];
      }
      return formatList.map(subFormat =>
        generateConfig.locale.format(locale.locale, value, subFormat),
      );
    },
    [value, formatList],
    (prev, next) => prev[0] !== next[0] || !shallowEqual(prev[1], next[1]),
  );
}

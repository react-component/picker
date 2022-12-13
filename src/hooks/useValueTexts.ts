import useMemo from 'rc-util/lib/hooks/useMemo';
import shallowEqual from 'shallowequal';
import type { GenerateConfig } from '../generate';
import type { CustomFormat, Locale } from '../interface';
import { formatValue, isEqual } from '../utils/dateUtil';

export type ValueTextConfig<DateType> = {
  formatList: (string | CustomFormat<DateType>)[];
  generateConfig: GenerateConfig<DateType>;
  locale: Locale;
};

export default function useValueTexts<DateType>(
  value: DateType | null,
  { formatList, generateConfig, locale }: ValueTextConfig<DateType>,
) {
  return useMemo<[string[], string]>(
    () => {
      if (!value) {
        return [[''], ''];
      }

      // We will convert data format back to first format
      let firstValueText: string = '';
      const fullValueTexts: string[] = [];

      for (let i = 0; i < formatList.length; i += 1) {
        const format = formatList[i];
        const formatStr = formatValue(value, { generateConfig, locale, format });
        fullValueTexts.push(formatStr);

        if (i === 0) {
          firstValueText = formatStr;
        }
      }

      return [fullValueTexts, firstValueText];
    },
    [value, formatList],
    (prev, next) =>
      // Not Same Date
      !isEqual(generateConfig, prev[0], next[0]) ||
      // Not Same format
      !shallowEqual(prev[1], next[1]),
  );
}

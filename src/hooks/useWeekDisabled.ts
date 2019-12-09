import * as React from 'react';
import { GenerateConfig } from '../generate';
import { Locale } from '../interface';

export default function useWeekDisabled<DateType>({
  disabledDate,
  locale,
  generateConfig,
}: {
  disabledDate: (date: DateType) => boolean;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;
}): [(date: DateType) => boolean] {
  const disabledCache = React.useMemo(() => new Map<string, boolean>(), [
    disabledDate,
  ]);
  function disabledWeekDate(date: DateType): boolean {
    const weekStr = generateConfig.locale.format(
      locale.locale,
      date,
      'YYYY-WW',
    );

    if (!disabledCache.has(weekStr)) {
      let disabled = false;
      const checkDisabled = (offset: 1 | -1) => {
        for (let i = 0; i < 7; i += 1) {
          const currentDate = generateConfig.addDate(date, i * offset);
          const currentWeekStr = generateConfig.locale.format(
            locale.locale,
            currentDate,
            'YYYY-WW',
          );

          if (currentWeekStr !== weekStr) {
            break;
          }

          if (disabledDate(currentDate)) {
            disabled = true;
            break;
          }
        }
      };
      checkDisabled(1);
      checkDisabled(-1);

      disabledCache.set(weekStr, disabled);
    }

    return disabledCache.get(weekStr)!;
  }

  return [disabledWeekDate];
}

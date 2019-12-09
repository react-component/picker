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
  const firstDay = React.useMemo(
    () => generateConfig.locale.getWeekFirstDay(locale.locale),
    [locale.locale],
  );

  function disabledWeekDate(date: DateType): boolean {
    const weekStr = generateConfig.locale.format(
      locale.locale,
      date,
      'YYYY-WW',
    );

    if (!disabledCache.has(weekStr)) {
      const weekDay = generateConfig.getWeekDay(date);
      let weekStartDate: DateType;

      // Set start week date
      if (weekDay < firstDay) {
        weekStartDate = generateConfig.setWeekDay(
          generateConfig.addDate(date, -7),
          firstDay,
        );
      } else {
        weekStartDate = generateConfig.setWeekDay(date, firstDay);
      }

      // Loop to find disabled status
      let disabled = false;
      for (let i = 0; i < 7; i += 1) {
        const currentDate = generateConfig.setWeekDay(weekStartDate, i);
        if (disabledDate(currentDate)) {
          disabled = true;
          break;
        }
      }

      disabledCache.set(weekStr, disabled);
    }

    return disabledCache.get(weekStr)!;
  }

  return [disabledWeekDate];
}

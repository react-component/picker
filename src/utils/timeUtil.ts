import { GenerateConfig } from '../generate';

// Type of function that generateUnitValues
type TypeGenerateUnitValues = (
  start: number,
  end: number,
  step: number,
  disabledUnits: number[],
) => number[];

export function setTime<DateType>(
  generateConfig: GenerateConfig<DateType>,
  date: DateType,
  hour: number,
  minute: number,
  second: number,
): DateType {
  let nextTime = generateConfig.setHour(date, hour);
  nextTime = generateConfig.setMinute(nextTime, minute);
  nextTime = generateConfig.setSecond(nextTime, second);
  return nextTime;
}

export function getBoundTime(
  generateUnitValues: TypeGenerateUnitValues,
  hour: number,
  minute: number,
  second: number,
  hourStep: number,
  minuteStep: number,
  secondStep: number,
  disabledHours?: () => number[],
  disabledMinutes?: (hour: number) => number[],
  disabledSeconds?: (hour: number, minute: number) => number[],
): [number, number, number] {
  const hours = generateUnitValues(0, 23, hourStep, disabledHours && disabledHours());
  const boundHour = getBoundTimeItem(hour, hours);
  const minutes = generateUnitValues(
    0,
    59,
    minuteStep,
    disabledMinutes && disabledMinutes(boundHour),
  );
  const boundMinute = getBoundTimeItem(minute, minutes);
  const seconds = generateUnitValues(
    0,
    59,
    secondStep,
    disabledSeconds && disabledSeconds(boundHour, boundMinute),
  );
  const boundSecond = getBoundTimeItem(second, seconds);

  if (boundHour < hour) {
    return [boundHour, minutes[minutes.length - 1], seconds[seconds.length - 1]];
  }
  if (boundHour > hour) {
    return [boundHour, minutes[0], seconds[0]];
  }
  if (boundMinute < minute) {
    return [boundHour, boundMinute, seconds[seconds.length - 1]];
  }
  if (boundMinute > minute) {
    return [boundHour, boundMinute, seconds[0]];
  }
  return [boundHour, boundMinute, boundSecond];
}

function getBoundTimeItem(timeItem: number, timeItems: number[]): number {
  let newTimeItem = -1;
  if (timeItems.length > 0) {
    const minTimeItem = timeItems[0];
    const maxTimeItem = timeItems[timeItems.length - 1];
    if (timeItem <= minTimeItem) {
      newTimeItem = minTimeItem;
    } else if (timeItem >= maxTimeItem) {
      newTimeItem = maxTimeItem;
    } else {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < timeItems.length; i++) {
        const lowerBoundTimeItem = timeItems[i];
        const higherBoundTimeItem = timeItems[i + 1];
        if (timeItem >= lowerBoundTimeItem) {
          newTimeItem =
            timeItem - lowerBoundTimeItem <= higherBoundTimeItem - timeItem
              ? lowerBoundTimeItem
              : higherBoundTimeItem;
        }
      }
    }
  }
  return newTimeItem;
}

export function getFuncGenerateUnitValues(): TypeGenerateUnitValues {
  const unitsCacheInternal = new Map<string, number[]>();
  return (start: number, end: number, step: number, disabledUnits: number[] = []): number[] => {
    if (unitsCacheInternal.has(`${start},${end},${step},${disabledUnits}`)) {
      return unitsCacheInternal.get(`${start},${end},${step},${disabledUnits}`);
    }
    const units: number[] = [];
    for (let i = start; i <= end; i += step) {
      if (!disabledUnits.includes(i)) {
        units.push(i);
      }
    }
    unitsCacheInternal.set(`${start},${end},${step},${disabledUnits}`, units);
    return units;
  };
}

export function getBoundTimeWrapper<DateType>(
  generateUnitValues: TypeGenerateUnitValues,
  generateConfig: GenerateConfig<DateType>,
  date: DateType,
  info: [
    number,
    number,
    number,
    () => number[],
    (hour: number) => number[],
    (hour: number, minute: number) => number[],
  ],
) {
  const [h, m, s] = getBoundTime(
    generateUnitValues,
    generateConfig.getHour(date),
    generateConfig.getMinute(date),
    generateConfig.getSecond(date),
    ...info,
  );
  return setTime(generateConfig, date, h, m, s);
}

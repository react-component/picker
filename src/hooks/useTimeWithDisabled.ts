import type { GenerateConfig } from '../generate';
import type { Unit } from '../panels/TimePanel/TimeUnitColumn';
import { setTime as utilSetTime } from '../utils/timeUtil';

export default function useTimeWithDisabled<DateType>({
  value,
  generateConfig,
  disabledMinutes,
  disabledSeconds,
  minutes,
  seconds,
  use12Hours,
}: {
  value: DateType;
  generateConfig: GenerateConfig<DateType>;
  disabledMinutes: (hour: number) => number[];
  disabledSeconds: (hour: number, minute: number) => number[];
  minutes: Unit[];
  seconds: Unit[];
  use12Hours: boolean;
}) {
  const setTime = (
    isNewPM: boolean | undefined,
    newHour: number,
    newMinute: number,
    newSecond: number,
  ) => {
    let newDate = value || generateConfig.getNow();

    const mergedHour = Math.max(0, newHour);
    let mergedMinute = Math.max(0, newMinute);
    let mergedSecond = Math.max(0, newSecond);

    const newDisabledMinutes = disabledMinutes && disabledMinutes(mergedHour);
    if (newDisabledMinutes?.includes(mergedMinute)) {
      // find the first available minute in minutes
      const availableMinute = minutes.find((i) => !newDisabledMinutes.includes(i.value));
      if (availableMinute) {
        mergedMinute = availableMinute.value;
      } else {
        return null;
      }
    }
    const newDisabledSeconds = disabledSeconds && disabledSeconds(mergedHour, mergedMinute);
    if (newDisabledSeconds?.includes(mergedSecond)) {
      // find the first available second in seconds
      const availableSecond = seconds.find((i) => !newDisabledSeconds.includes(i.value));
      if (availableSecond) {
        mergedSecond = availableSecond.value;
      } else {
        return null;
      }
    }

    newDate = utilSetTime(
      generateConfig,
      newDate,
      !use12Hours || !isNewPM ? mergedHour : mergedHour + 12,
      mergedMinute,
      mergedSecond,
    );

    return newDate;
  };

  return setTime;
}

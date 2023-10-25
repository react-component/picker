import type { GenerateConfig } from '../../../../generate';
import type { Unit } from './TimeColumn';

export function findValidateTime<DateType>(
  date: DateType,
  getHourUnits: () => Unit<number>[],
  getMinuteUnits: (hour: number) => Unit<number>[],
  getSecondUnits: (hour: number, minute: number) => Unit<number>[],
  generateConfig: GenerateConfig<DateType>,
) {
  let nextDate = date;

  function alignValidate(getUnitValue: string, setUnitValue: string, units: Unit<number>[]) {
    let nextValue = generateConfig[getUnitValue](nextDate);
    const nextUnit = units.find((unit) => unit.value === nextValue);

    if (!nextUnit || nextUnit.disabled) {
      const validateUnit = units.find((unit) => !unit.disabled);
      nextValue = validateUnit!.value;
      nextDate = generateConfig[setUnitValue](nextDate, nextValue);
    }

    return nextValue;
  }

  // Find validate hour
  const nextHour = alignValidate('getHour', 'setHour', getHourUnits());

  // Find validate minute
  const nextMinute = alignValidate('getMinute', 'setMinute', getMinuteUnits(nextHour));

  // Find validate second
  alignValidate('getSecond', 'setSecond', getSecondUnits(nextHour, nextMinute));

  return nextDate;
}

import { GenerateConfig } from '../generate';

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
  return nextTime
}

// Get the closest time of now under the constraint of time step
export function getClosestTime(
  now: {
    hour: number;
    minute: number;
    second: number;
  },
  steps: {
    hourStep: number;
    minuteStep: number;
    secondStep: number;
  },
): {
  hour: number;
  minute: number;
  second: number;
} {
  const { hour, minute, second } = now;
  const { hourStep, minuteStep, secondStep } = steps;
  const lowerBoundHour = Math.floor(hour / hourStep) * hourStep;
  let upperBoundHour = Math.ceil(hour / hourStep) * hourStep;
  let lowerBoundMinute;
  let lowerBoundSecond;
  let upperBoundMinute;
  let upperBoundSecond;
  if (lowerBoundHour < hour) {
    lowerBoundMinute = 60 - minuteStep;
    lowerBoundSecond = 60 - secondStep;
    upperBoundMinute = 0;
    upperBoundSecond = 0;
  } else {
    lowerBoundMinute = Math.floor(minute / minuteStep) * minuteStep;
    upperBoundMinute = Math.ceil(minute / minuteStep) * minuteStep;
    if (upperBoundMinute === 60 && (hour + 1) % hourStep === 0) {
      upperBoundHour = hour + 1;
      upperBoundMinute = 0;
      upperBoundSecond = 0;
      lowerBoundSecond = 60 - secondStep;
    } else if (lowerBoundMinute < minute) {
      lowerBoundSecond = 60 - secondStep;
      upperBoundSecond = 0;
    } else {
      lowerBoundSecond = Math.floor(second / secondStep) * secondStep;
      upperBoundSecond = Math.ceil(second / secondStep) * secondStep;
      if (upperBoundSecond === 60 && (minute + 1) % minuteStep === 0) {
        if (minute + 1 === 60 && (hour + 1) % hourStep === 0) {
          upperBoundHour = hour + 1;
          upperBoundMinute = 0;
          upperBoundSecond = 0;
        } else {
          upperBoundMinute = minute + 1;
          upperBoundSecond = 0;
        }
      }
    }
    upperBoundMinute %= 60;
    upperBoundSecond %= 60;
  }
  const nowAsSecond = hour * 3600 + minute * 60 + second;
  const lowerBoundAsSecond = lowerBoundHour * 3600 + lowerBoundMinute * 60 + lowerBoundSecond;
  const upperBoundAsSecond = upperBoundHour * 3600 + upperBoundMinute * 60 + upperBoundSecond;
  if (Math.abs(upperBoundAsSecond - nowAsSecond) < Math.abs(lowerBoundAsSecond - nowAsSecond)) {
    return { hour: upperBoundHour % 24, minute: upperBoundMinute, second: upperBoundSecond };
  }
  return { hour: lowerBoundHour % 24, minute: lowerBoundMinute, second: lowerBoundSecond };
}

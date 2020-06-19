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
  return nextTime;
}

export function getLowerBoundTime(
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
  let lowerBoundMinute: number;
  let lowerBoundSecond: number;
  if (lowerBoundHour < hour) {
    lowerBoundMinute = 60 - minuteStep;
    lowerBoundSecond = 60 - secondStep;
  } else {
    lowerBoundMinute = Math.floor(minute / minuteStep) * minuteStep;
    if (lowerBoundMinute < minute) {
      lowerBoundSecond = 60 - secondStep;
    } else {
      lowerBoundSecond = Math.floor(second / secondStep) * secondStep;
    }
  }
  return {
    hour: lowerBoundHour,
    minute: lowerBoundMinute,
    second: lowerBoundSecond,
  };
}

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
  if (lowerBoundHour < hour) {
    return {
      hour: lowerBoundHour,
      minute: 60 - minuteStep,
      second: 60 - secondStep,
    };
  }
  const lowerBoundMinute = Math.floor(minute / minuteStep) * minuteStep;
  if (lowerBoundMinute < minute) {
    return {
      hour: lowerBoundHour,
      minute: lowerBoundMinute,
      second: 60 - secondStep,
    };
  }
  const lowerBoundSecond = Math.floor(second / secondStep) * secondStep;
  return {
    hour: lowerBoundHour,
    minute: lowerBoundMinute,
    second: lowerBoundSecond,
  };
}

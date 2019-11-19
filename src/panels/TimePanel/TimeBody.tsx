import * as React from 'react';
import { GenerateConfig } from '../../utils/generateUtil';
import { Locale } from '../../interface';
import TimeUnitColumn, { Unit } from './TimeUnitColumn';
import { leftPad } from '../../utils/stringUtil';
import { SharedTimeProps } from '.';

function generateUnits(
  start: number,
  end: number,
  step: number,
  disabledUnits: number[] | undefined,
) {
  const units: Unit[] = [];
  for (let i = start; i <= end; i += step) {
    units.push({
      label: leftPad(i, 2),
      value: i,
      disabled: (disabledUnits || []).includes(i),
    });
  }
  return units;
}

export interface TimeBodyProps<DateType> extends SharedTimeProps {
  prefixCls: string;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;
  value: DateType;
  onSelect: (value: DateType) => void;
}

function TimeBody<DateType>(props: TimeBodyProps<DateType>) {
  const {
    generateConfig,
    prefixCls,
    value,
    showHour,
    showMinute,
    showSecond,
    use12Hours,
    hourStep = 1,
    minuteStep = 1,
    secondStep = 1,
    disabledHours,
    disabledMinutes,
    disabledSeconds,
    onSelect,
  } = props;
  const contentPrefixCls = `${prefixCls}-content`;

  let isAM = false;
  let hour = generateConfig.getHour(value);
  const minute = generateConfig.getMinute(value);
  const second = generateConfig.getSecond(value);

  const hours = generateUnits(
    0,
    use12Hours ? 11 : 23,
    hourStep,
    disabledHours && disabledHours(),
  );

  // Should additional logic to handle 12 hours
  if (use12Hours) {
    isAM = hour < 12;
    hour %= 12;
    hours[0].label = '12';
  }

  const minutes = generateUnits(
    0,
    59,
    minuteStep,
    disabledMinutes && disabledMinutes(hour),
  );

  const seconds = generateUnits(
    0,
    59,
    secondStep,
    disabledSeconds && disabledSeconds(hour, minute),
  );

  return (
    <div className={contentPrefixCls}>
      {showHour !== false && (
        <TimeUnitColumn
          prefixCls={prefixCls}
          units={hours}
          onSelect={num => {
            onSelect(generateConfig.setHour(value, num));
          }}
          value={hour}
        />
      )}
      {showMinute !== false && (
        <TimeUnitColumn
          prefixCls={prefixCls}
          units={minutes}
          onSelect={num => {
            onSelect(generateConfig.setMinute(value, num));
          }}
          value={minute}
        />
      )}
      {showSecond !== false && (
        <TimeUnitColumn
          prefixCls={prefixCls}
          units={seconds}
          onSelect={num => {
            onSelect(generateConfig.setSecond(value, num));
          }}
          value={second}
        />
      )}
      {use12Hours && (
        <TimeUnitColumn
          prefixCls={prefixCls}
          units={[{ label: 'AM', value: 0 }, { label: 'PM', value: 1 }]}
          value={isAM ? 0 : 1}
          onSelect={num => {
            onSelect(generateConfig.setHour(value, num * 12 + hour));
          }}
        />
      )}
    </div>
  );
}

export default TimeBody;

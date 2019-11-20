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

export interface BodyOperationRef {
  onUpDown: (diff: number) => void;
}

export interface TimeBodyProps<DateType> extends SharedTimeProps {
  prefixCls: string;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;
  value: DateType;
  onSelect: (value: DateType) => void;
  activeColumnIndex: number;
  operationRef: React.MutableRefObject<BodyOperationRef | undefined>;
}

function TimeBody<DateType>(props: TimeBodyProps<DateType>) {
  const {
    generateConfig,
    prefixCls,
    operationRef,
    activeColumnIndex,
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

  const columns: {
    node: React.ReactElement;
    value: number;
    units: Unit[];
    onSelect: (diff: number) => void;
  }[] = [];
  const contentPrefixCls = `${prefixCls}-content`;

  let isAM = false;
  let hour = generateConfig.getHour(value);
  const minute = generateConfig.getMinute(value);
  const second = generateConfig.getSecond(value);

  // ========================= Unit =========================
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

  // ====================== Operations ======================
  operationRef.current = {
    onUpDown: diff => {
      const column = columns[activeColumnIndex];
      if (column) {
        const valueIndex = column.units.findIndex(
          unit => unit.value === column.value,
        );

        const unitLen = column.units.length;
        for (let i = 1; i < unitLen; i += 1) {
          const nextUnit =
            column.units[(valueIndex + diff * i + unitLen) % unitLen];

          if (nextUnit.disabled !== true) {
            column.onSelect(nextUnit.value);
            break;
          }
        }
      }
    },
  };

  // ======================== Render ========================
  function addColumnNode(
    condition: boolean | undefined,
    node: React.ReactElement,
    columnValue: number,
    units: Unit[],
    onColumnSelect: (diff: number) => void,
  ) {
    if (condition !== false) {
      columns.push({
        node: React.cloneElement(node, {
          value: columnValue,
          active: activeColumnIndex === columns.length,
          onSelect: onColumnSelect,
          units,
        }),
        onSelect: onColumnSelect,
        value: columnValue,
        units,
      });
    }
  }

  // Hour
  addColumnNode(
    showHour,
    <TimeUnitColumn key="hour" prefixCls={prefixCls} />,
    hour,
    hours,
    num => {
      let newHour = num;
      if (use12Hours) {
        newHour += (isAM ? 0 : 1) * 12;
      }
      onSelect(generateConfig.setHour(value, newHour));
    },
  );

  // Minute
  addColumnNode(
    showMinute,
    <TimeUnitColumn key="minute" prefixCls={prefixCls} />,
    minute,
    minutes,
    num => {
      onSelect(generateConfig.setMinute(value, num));
    },
  );

  // Second
  addColumnNode(
    showSecond,
    <TimeUnitColumn key="second" prefixCls={prefixCls} />,
    second,
    seconds,
    num => {
      onSelect(generateConfig.setSecond(value, num));
    },
  );

  // 12 Hours
  addColumnNode(
    use12Hours === true,
    <TimeUnitColumn key="12hours" prefixCls={prefixCls} />,
    isAM ? 0 : 1,
    [{ label: 'AM', value: 0 }, { label: 'PM', value: 1 }],
    num => {
      onSelect(generateConfig.setHour(value, num * 12 + hour));
    },
  );

  return (
    <div className={contentPrefixCls}>{columns.map(({ node }) => node)}</div>
  );
}

export default TimeBody;

import * as React from 'react';
import useMemo from 'rc-util/lib/hooks/useMemo';
import type { GenerateConfig } from '../../generate';
import type { Locale, OnSelect } from '../../interface';
import type { Unit } from './TimeUnitColumn';
import TimeUnitColumn from './TimeUnitColumn';
import { leftPad } from '../../utils/miscUtil';
import type { SharedTimeProps } from '.';
import { setTime as utilSetTime } from '../../utils/timeUtil';

function shouldUnitsUpdate(prevUnits: Unit[], nextUnits: Unit[]) {
  if (prevUnits.length !== nextUnits.length) return true;
  // if any unit's disabled status is different, the units should be re-evaluted
  for (let i = 0; i < prevUnits.length; i += 1) {
    if (prevUnits[i].disabled !== nextUnits[i].disabled) return true;
  }
  return false;
}

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

export type BodyOperationRef = {
  onUpDown: (diff: number) => void;
};

export type TimeBodyProps<DateType> = {
  prefixCls: string;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;
  value?: DateType | null;
  onSelect: OnSelect<DateType>;
  activeColumnIndex: number;
  operationRef: React.MutableRefObject<BodyOperationRef | undefined>;
} & SharedTimeProps<DateType>;

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
    disabledTime,
    hideDisabledOptions,
    onSelect,
  } = props;

  // Misc
  const columns: {
    node: React.ReactElement;
    value: number;
    units: Unit[];
    onSelect: (diff: number) => void;
  }[] = [];
  const contentPrefixCls = `${prefixCls}-content`;
  const columnPrefixCls = `${prefixCls}-time-panel`;

  let isPM: boolean | undefined;
  const originHour = value ? generateConfig.getHour(value) : -1;
  let hour = originHour;
  const minute = value ? generateConfig.getMinute(value) : -1;
  const second = value ? generateConfig.getSecond(value) : -1;

  // Disabled Time
  const now = generateConfig.getNow();
  const [mergedDisabledHours, mergedDisabledMinutes, mergedDisabledSeconds] = React.useMemo(() => {
    if (disabledTime) {
      const disabledConfig = disabledTime(now);
      return [
        disabledConfig.disabledHours,
        disabledConfig.disabledMinutes,
        disabledConfig.disabledSeconds,
      ];
    }

    return [disabledHours, disabledMinutes, disabledSeconds];
  }, [disabledHours, disabledMinutes, disabledSeconds, disabledTime, now]);

  // Set Time
  const setTime = (
    isNewPM: boolean | undefined,
    newHour: number,
    newMinute: number,
    newSecond: number,
  ) => {
    let newDate = value || generateConfig.getNow();

    const mergedHour = Math.max(0, newHour);
    const mergedMinute = Math.max(0, newMinute);
    const mergedSecond = Math.max(0, newSecond);

    newDate = utilSetTime(
      generateConfig,
      newDate,
      !use12Hours || !isNewPM ? mergedHour : mergedHour + 12,
      mergedMinute,
      mergedSecond,
    );

    return newDate;
  };

  // ========================= Unit =========================
  const rawHours = generateUnits(0, 23, hourStep, mergedDisabledHours && mergedDisabledHours());

  const memorizedRawHours = useMemo(() => rawHours, rawHours, shouldUnitsUpdate);

  // Should additional logic to handle 12 hours
  if (use12Hours) {
    isPM = hour >= 12; // -1 means should display AM
    hour %= 12;
  }

  const [AMDisabled, PMDisabled] = React.useMemo(() => {
    if (!use12Hours) {
      return [false, false];
    }
    const AMPMDisabled = [true, true];
    memorizedRawHours.forEach(({ disabled, value: hourValue }) => {
      if (disabled) return;
      if (hourValue >= 12) {
        AMPMDisabled[1] = false;
      } else {
        AMPMDisabled[0] = false;
      }
    });
    return AMPMDisabled;
  }, [use12Hours, memorizedRawHours]);

  const hours = React.useMemo(() => {
    if (!use12Hours) return memorizedRawHours;
    return memorizedRawHours
      .filter(isPM ? (hourMeta) => hourMeta.value >= 12 : (hourMeta) => hourMeta.value < 12)
      .map((hourMeta) => {
        const hourValue = hourMeta.value % 12;
        const hourLabel = hourValue === 0 ? '12' : leftPad(hourValue, 2);
        return {
          ...hourMeta,
          label: hourLabel,
          value: hourValue,
        };
      });
  }, [use12Hours, isPM, memorizedRawHours]);

  const minutes = generateUnits(
    0,
    59,
    minuteStep,
    mergedDisabledMinutes && mergedDisabledMinutes(originHour),
  );

  const seconds = generateUnits(
    0,
    59,
    secondStep,
    mergedDisabledSeconds && mergedDisabledSeconds(originHour, minute),
  );

  // ====================== Operations ======================
  operationRef.current = {
    onUpDown: (diff) => {
      const column = columns[activeColumnIndex];
      if (column) {
        const valueIndex = column.units.findIndex((unit) => unit.value === column.value);

        const unitLen = column.units.length;
        for (let i = 1; i < unitLen; i += 1) {
          const nextUnit = column.units[(valueIndex + diff * i + unitLen) % unitLen];

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
          prefixCls: columnPrefixCls,
          value: columnValue,
          active: activeColumnIndex === columns.length,
          onSelect: onColumnSelect,
          units,
          hideDisabledOptions,
        }),
        onSelect: onColumnSelect,
        value: columnValue,
        units,
      });
    }
  }

  // Hour
  addColumnNode(showHour, <TimeUnitColumn key="hour" />, hour, hours, (num) => {
    onSelect(setTime(isPM, num, minute, second), 'mouse');
  });

  // Minute
  addColumnNode(showMinute, <TimeUnitColumn key="minute" />, minute, minutes, (num) => {
    onSelect(setTime(isPM, hour, num, second), 'mouse');
  });

  // Second
  addColumnNode(showSecond, <TimeUnitColumn key="second" />, second, seconds, (num) => {
    onSelect(setTime(isPM, hour, minute, num), 'mouse');
  });

  // 12 Hours
  let PMIndex = -1;
  if (typeof isPM === 'boolean') {
    PMIndex = isPM ? 1 : 0;
  }

  addColumnNode(
    use12Hours === true,
    <TimeUnitColumn key="12hours" />,
    PMIndex,
    [
      { label: 'AM', value: 0, disabled: AMDisabled },
      { label: 'PM', value: 1, disabled: PMDisabled },
    ],
    (num) => {
      onSelect(setTime(!!num, hour, minute, second), 'mouse');
    },
  );

  return <div className={contentPrefixCls}>{columns.map(({ node }) => node)}</div>;
}

export default TimeBody;

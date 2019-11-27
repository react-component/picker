import * as React from 'react';
import classNames from 'classnames';
import Picker, {
  PickerBaseProps,
  PickerDateProps,
  PickerTimeProps,
} from './Picker';
import {
  NullableDateType,
  DisabledTimes,
  DisabledTime,
  PickerMode,
} from './interface';
import { toArray } from './utils/miscUtil';
import RangeContext from './RangeContext';
import { isSameDate } from './utils/dateUtil';
import { getDefaultFormat } from './utils/uiUtil';

type RangeValue<DateType> = [DateType | null, DateType | null] | null;

function canTriggerChange<DateType>(
  dates: [DateType | null, DateType | null],
  allowEmpty?: [boolean, boolean],
): boolean {
  const passStart = dates[0] || (allowEmpty && allowEmpty[0]);
  const passEnd = dates[1] || (allowEmpty && allowEmpty[1]);
  return !!(passStart && passEnd);
}

export interface RangePickerSharedProps<DateType> {
  value?: RangeValue<DateType>;
  defaultValue?: RangeValue<DateType>;
  defaultPickerValue?: [DateType, DateType];
  placeholder?: [string, string];
  disabledTime?: (
    date: DateType | null,
    type: 'start' | 'end',
  ) => DisabledTimes;
  ranges?: Record<
    string,
    | Exclude<RangeValue<DateType>, null>
    | (() => Exclude<RangeValue<DateType>, null>)
  >;
  separator?: string;
  allowEmpty?: [boolean, boolean];
  selectable?: [boolean, boolean];
  onChange?: (
    value: RangeValue<DateType>,
    formatString: [string, string],
  ) => void;
  onCalendarChange?: (
    value: RangeValue<DateType>,
    formatString: [string, string],
  ) => void;
}

type OmitPickerProps<Props> = Omit<
  Props,
  | 'value'
  | 'defaultValue'
  | 'defaultPickerValue'
  | 'onChange'
  | 'placeholder'
  | 'disabledTime'
  | 'showToday'
>;

export interface RangePickerBaseProps<DateType>
  extends RangePickerSharedProps<DateType>,
    OmitPickerProps<PickerBaseProps<DateType>> {}

export interface RangePickerDateProps<DateType>
  extends RangePickerSharedProps<DateType>,
    OmitPickerProps<PickerDateProps<DateType>> {}

export interface RangePickerTimeProps<DateType>
  extends RangePickerSharedProps<DateType>,
    OmitPickerProps<PickerTimeProps<DateType>> {}

export type RangePickerProps<DateType> =
  | RangePickerBaseProps<DateType>
  | RangePickerDateProps<DateType>
  | RangePickerTimeProps<DateType>;

interface MergedRangePickerProps<DateType>
  extends Omit<
    RangePickerBaseProps<DateType> &
      RangePickerDateProps<DateType> &
      RangePickerTimeProps<DateType>,
    'picker'
  > {
  picker?: PickerMode;
}

function RangePicker<DateType>(props: RangePickerProps<DateType>) {
  const {
    prefixCls = 'rc-picker',
    className,
    style,
    value,
    defaultValue,
    defaultPickerValue,
    separator = '~',
    picker,
    locale,
    generateConfig,
    placeholder,
    showTime,
    use12Hours,
    disabledTime,
    ranges,
    format,
    allowEmpty,
    selectable,
    disabled,
    onChange,
    onCalendarChange,
  } = props as MergedRangePickerProps<DateType>;

  const formatList = toArray(
    getDefaultFormat(format, picker, showTime, use12Hours),
  );

  const mergedSelectable = React.useMemo<
    [boolean | undefined, boolean | undefined]
  >(() => [selectable && selectable[0], selectable && selectable[1]], [
    selectable,
  ]);

  // ============================= Values =============================
  const [innerValue, setInnerValue] = React.useState<RangeValue<DateType>>(
    () => {
      if (value !== undefined) {
        return value;
      }
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      return null;
    },
  );

  const mergedValue = value !== undefined ? value : innerValue;

  // Get picker value, should order this internally
  const [value1, value2] = React.useMemo(() => {
    let val1 = mergedValue ? mergedValue[0] : null;
    let val2 = mergedValue ? mergedValue[1] : null;

    // Exchange
    if (val1 && val2 && generateConfig.isAfter(val1, val2)) {
      const tmp = val1;
      val1 = val2;
      val2 = tmp;
    }

    return [val1, val2];
  }, [mergedValue]);

  // Select value: used for click to update ranged value. Must set in pair
  const [selectedValues, setSelectedValues] = React.useState<
    [DateType, DateType] | undefined
  >(undefined);

  React.useEffect(() => {
    if (value1 && value2) {
      setSelectedValues([value1, value2]);
    } else {
      setSelectedValues(undefined);
    }
  }, [value1, value2]);

  const onStartSelect = (date: DateType) => {
    if (value2) {
      setSelectedValues([date, value2]);
    } else {
      setSelectedValues(undefined);
    }
  };

  const onEndSelect = (date: DateType) => {
    if (value1) {
      setSelectedValues([value1, date]);
    } else {
      setSelectedValues(undefined);
    }
  };

  // ============================= Change =============================
  const formatDate = (date: NullableDateType<DateType>) =>
    (date
      ? generateConfig.locale.format(locale.locale, date, formatList[0])
      : '');

  const onInternalChange = (
    values: NullableDateType<DateType>[],
    changedByStartTime: boolean,
  ) => {
    const startDate: DateType | null = values[0] || null;
    let endDate: DateType | null = values[1] || null;

    // If user change start time is after end time, should reset end time to null
    if (
      startDate &&
      endDate &&
      !isSameDate(generateConfig, startDate, endDate) &&
      generateConfig.isAfter(startDate, endDate) &&
      changedByStartTime
    ) {
      endDate = null;
    }

    setInnerValue([startDate, endDate]);

    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);

    if (onChange && canTriggerChange([startDate, endDate], allowEmpty)) {
      onChange([startDate, endDate], [startStr, endStr]);
    }

    if (onCalendarChange) {
      onCalendarChange([startDate, endDate], [startStr, endStr]);
    }
  };

  // ============================= Render =============================
  const pickerProps = {
    ...props,
    defaultValue: undefined,
    defaultPickerValue: undefined,
    className: undefined,
    style: undefined,
    placeholder: undefined,
    disabledTime: undefined,
  };

  // Time
  let disabledStartTime: DisabledTime<DateType> | undefined;
  let disabledEndTime: DisabledTime<DateType> | undefined;

  if (disabledTime) {
    disabledStartTime = (date: DateType | null) => disabledTime(date, 'start');
    disabledEndTime = (date: DateType | null) => disabledTime(date, 'end');
  }

  // Ranges
  let extraFooterSelections:
    | {
        label: string;
        onClick: React.MouseEventHandler<HTMLElement>;
      }[]
    | undefined;
  if (ranges) {
    extraFooterSelections = Object.keys(ranges).map(label => ({
      label,
      onClick: () => {
        const rangedValue = ranges[label];
        onInternalChange(
          typeof rangedValue === 'function' ? rangedValue() : rangedValue,
          false,
        );
      },
    }));
  }

  // End date should disabled before start date
  const { disabledDate } = pickerProps;

  const disabledStartDate = (date: DateType) => {
    let mergedDisabled = disabledDate ? disabledDate(date) : false;

    if (mergedSelectable[1] === false && value2) {
      mergedDisabled =
        !isSameDate(generateConfig, date, value2) &&
        generateConfig.isAfter(date, value2);
    }

    return mergedDisabled;
  };

  const disabledEndDate = (date: DateType) => {
    let mergedDisabled = disabledDate ? disabledDate(date) : false;

    if (!mergedDisabled && value1) {
      // Can be the same date
      mergedDisabled =
        !isSameDate(generateConfig, value1, date) &&
        generateConfig.isAfter(value1, date);
    }

    return mergedDisabled;
  };

  return (
    <RangeContext.Provider
      value={{
        extraFooterSelections,
        rangedValue: selectedValues,
      }}
    >
      <div
        className={classNames(`${prefixCls}-range`, className)}
        style={style}
      >
        <Picker<DateType>
          {...pickerProps}
          prefixCls={prefixCls}
          value={value1}
          placeholder={placeholder && placeholder[0]}
          defaultPickerValue={defaultPickerValue && defaultPickerValue[0]}
          {...{ disabledTime: disabledStartTime }} // Fix ts define
          disabled={disabled || mergedSelectable[0] === false}
          disabledDate={disabledStartDate}
          onChange={date => {
            onInternalChange([date, value2], true);
          }}
          onSelect={onStartSelect}
        />
        {separator}
        <Picker<DateType>
          {...pickerProps}
          prefixCls={prefixCls}
          value={value2}
          placeholder={placeholder && placeholder[1]}
          defaultPickerValue={defaultPickerValue && defaultPickerValue[1]}
          {...{ disabledTime: disabledEndTime }} // Fix ts define
          disabled={disabled || mergedSelectable[1] === false}
          disabledDate={disabledEndDate}
          onChange={date => {
            onInternalChange([value1, date], false);
          }}
          onSelect={onEndSelect}
        />
      </div>
    </RangeContext.Provider>
  );
}

export default RangePicker;

/**
 * TODO:
 *  - Highlight range when hover the ranges value
 *  - Click ranges value will go to the related panel
 */

import * as React from 'react';
import classNames from 'classnames';
import Picker, {
  PickerBaseProps,
  PickerDateProps,
  PickerTimeProps,
  PickerRefConfig,
} from './Picker';
import {
  NullableDateType,
  DisabledTimes,
  DisabledTime,
  PickerMode,
  PanelMode,
  OnPanelChange,
} from './interface';
import { toArray } from './utils/miscUtil';
import RangeContext from './RangeContext';
import { isSameDate } from './utils/dateUtil';
import { getDefaultFormat } from './utils/uiUtil';
import { SharedTimeProps } from './panels/TimePanel';

type EventValue<DateType> = DateType | null;
type RangeValue<DateType> = [EventValue<DateType>, EventValue<DateType>] | null;

function canTriggerChange<DateType>(
  dates: [EventValue<DateType>, EventValue<DateType>],
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
    date: EventValue<DateType>,
    type: 'start' | 'end',
  ) => DisabledTimes;
  ranges?: Record<
    string,
    | Exclude<RangeValue<DateType>, null>
    | (() => Exclude<RangeValue<DateType>, null>)
  >;
  separator?: React.ReactNode;
  allowEmpty?: [boolean, boolean];
  selectable?: [boolean, boolean];
  mode?: [PanelMode, PanelMode];
  onChange?: (
    values: RangeValue<DateType>,
    formatString: [string, string],
  ) => void;
  onCalendarChange?: (
    values: RangeValue<DateType>,
    formatString: [string, string],
  ) => void;
  onPanelChange?: (
    values: RangeValue<DateType>,
    modes: [PanelMode, PanelMode],
  ) => void;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

type OmitPickerProps<Props> = Omit<
  Props,
  | 'value'
  | 'defaultValue'
  | 'defaultPickerValue'
  | 'placeholder'
  | 'disabledTime'
  | 'showToday'
  | 'showTime'
  | 'mode'
  | 'onChange'
  | 'onSelect'
  | 'onPanelChange'
>;

export interface RangePickerBaseProps<DateType>
  extends RangePickerSharedProps<DateType>,
    OmitPickerProps<PickerBaseProps<DateType>> {}

export interface RangePickerDateProps<DateType>
  extends RangePickerSharedProps<DateType>,
    OmitPickerProps<PickerDateProps<DateType>> {
  showTime?:
    | boolean
    | (Omit<SharedTimeProps<DateType>, 'defaultValue'> & {
        defaultValue?: DateType[];
      });
}

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

function InternalRangePicker<DateType>(
  props: RangePickerProps<DateType> & {
    pickerRef: React.Ref<PickerRefConfig>;
  },
) {
  const {
    prefixCls = 'rc-picker',
    className,
    style,
    value,
    defaultValue,
    defaultPickerValue,
    separator = '~',
    mode,
    picker,
    pickerRef,
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
    onPanelChange,
    onFocus,
    onBlur,
  } = props as MergedRangePickerProps<DateType> & {
    pickerRef: React.MutableRefObject<PickerRefConfig>;
  };

  const formatList = toArray(
    getDefaultFormat(format, picker, showTime, use12Hours),
  );

  const [startShowTime, endShowTime] = React.useMemo(() => {
    if (showTime && typeof showTime === 'object' && showTime.defaultValue) {
      return [
        { ...showTime, defaultValue: showTime.defaultValue[0] },
        { ...showTime, defaultValue: showTime.defaultValue[1] },
      ];
    }
    return [showTime, showTime];
  }, [showTime]);

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
    [DateType | null, DateType | null] | undefined
  >(undefined);

  React.useEffect(() => {
    setSelectedValues([value1, value2]);
  }, [value1, value2]);

  const onStartSelect = (date: DateType) => {
    setSelectedValues([date, value2]);
  };

  const onEndSelect = (date: DateType) => {
    setSelectedValues([value1, date]);
  };

  // ============================= Change =============================
  const formatDate = (date: NullableDateType<DateType>) => {
    if (date) {
      return generateConfig.locale.format(locale.locale, date, formatList[0]);
    }
    return '';
  };

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

  // ============================== Open ==============================
  const startPickerRef = React.useRef<Picker<DateType>>(null);
  const endPickerRef = React.useRef<Picker<DateType>>(null);
  const lastOpenIdRef = React.useRef<number>();

  const onStartOpenChange = (open: boolean) => {
    if (!open && selectedValues && selectedValues[0]) {
      lastOpenIdRef.current = window.setTimeout(() => {
        if (endPickerRef.current) {
          endPickerRef.current!.focus();
          endPickerRef.current!.open();
        }
      }, 100);
    }

    if (props.onOpenChange) {
      props.onOpenChange(open);
    }
  };

  React.useEffect(
    () => () => {
      window.clearTimeout(lastOpenIdRef.current);
    },
    [],
  );

  if (pickerRef) {
    pickerRef.current = startPickerRef.current as any;
  }

  // ============================== Mode ==============================
  /**
   * [Legacy] handle internal `onPanelChange`
   */
  const [innerModes, setInnerModes] = React.useState((): [
    PanelMode,
    PanelMode,
  ] => {
    if (mode) {
      return mode;
    }
    if (picker) {
      return [picker, picker];
    }
    return showTime ? ['datetime', 'datetime'] : ['date', 'date'];
  });
  const [onStartPanelChange, onEndPanelChange] = React.useMemo<
    [OnPanelChange<DateType> | undefined, OnPanelChange<DateType> | undefined]
  >(() => {
    const onInternalPanelChange = (
      newValue: DateType,
      newMode: PanelMode,
      source: 'start' | 'end',
    ) => {
      const values: [EventValue<DateType>, EventValue<DateType>] = [
        ...(mergedValue || []),
      ] as [EventValue<DateType>, EventValue<DateType>];
      const modes: [PanelMode, PanelMode] = [...innerModes] as [
        PanelMode,
        PanelMode,
      ];

      if (source === 'start') {
        values[0] = newValue;
        modes[0] = newMode;
      } else {
        values[1] = newValue;
        modes[1] = newMode;
      }
      setInnerModes(modes);

      if (onPanelChange) {
        onPanelChange(values, modes);
      }
    };

    return [
      (newVal: DateType, newMode: PanelMode) => {
        onInternalPanelChange(newVal, newMode, 'start');
      },
      (newVal: DateType, newMode: PanelMode) => {
        onInternalPanelChange(newVal, newMode, 'end');
      },
    ];
  }, [onPanelChange, mode, picker]);

  React.useEffect(() => {
    if (mode) {
      setInnerModes(mode);
    }
  }, [mode]);

  // ============================= Render =============================
  const pickerProps = {
    ...props,
    defaultValue: undefined,
    defaultPickerValue: undefined,
    className: undefined,
    style: undefined,
    placeholder: undefined,
    disabledTime: undefined,
    onPanelChange: undefined,
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
        inRange: true,
      }}
    >
      <div
        className={classNames(`${prefixCls}-range`, className)}
        style={style}
      >
        <Picker<DateType>
          {...pickerProps}
          ref={startPickerRef}
          prefixCls={prefixCls}
          value={value1}
          placeholder={placeholder && placeholder[0]}
          defaultPickerValue={defaultPickerValue && defaultPickerValue[0]}
          {...{ disabledTime: disabledStartTime, showTime: startShowTime }} // Fix ts define
          mode={mode && mode[0]}
          disabled={disabled || mergedSelectable[0] === false}
          disabledDate={disabledStartDate}
          onChange={date => {
            onInternalChange([date, value2], true);
          }}
          onSelect={onStartSelect}
          onFocus={onFocus}
          onBlur={onBlur}
          onPanelChange={onStartPanelChange}
          onOpenChange={onStartOpenChange}
        />
        {separator}
        <Picker<DateType>
          {...pickerProps}
          ref={endPickerRef}
          prefixCls={prefixCls}
          value={value2}
          placeholder={placeholder && placeholder[1]}
          defaultPickerValue={defaultPickerValue && defaultPickerValue[1]}
          {...{ disabledTime: disabledEndTime, showTime: endShowTime }} // Fix ts define
          mode={mode && mode[1]}
          disabled={disabled || mergedSelectable[1] === false}
          disabledDate={disabledEndDate}
          onChange={date => {
            onInternalChange([value1, date], false);
          }}
          onSelect={onEndSelect}
          onFocus={onFocus}
          onBlur={onBlur}
          onPanelChange={onEndPanelChange}
        />
      </div>
    </RangeContext.Provider>
  );
}

// Wrap with class component to enable pass generic with instance method
class RangePicker<DateType> extends React.Component<
  RangePickerProps<DateType>
> {
  pickerRef = React.createRef<PickerRefConfig>();

  focus = () => {
    if (this.pickerRef.current) {
      this.pickerRef.current.focus();
    }
  };

  blur = () => {
    if (this.pickerRef.current) {
      this.pickerRef.current.blur();
    }
  };

  render() {
    return (
      <InternalRangePicker<DateType>
        {...this.props}
        pickerRef={this.pickerRef as React.MutableRefObject<PickerRefConfig>}
      />
    );
  }
}

export default RangePicker;

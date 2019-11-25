import * as React from 'react';
import classNames from 'classnames';
import Picker, { PickerProps } from './Picker';
import { NullableDateType, DisabledTimes, DisabledTime } from './interface';
import { toArray } from './utils/miscUtil';

// TODO: 'before - 2010-11-11' or '2011-11-11 - forever'
type RangeValue<DateType> = [DateType | null, DateType | null] | null;

export interface RangePickerProps<DateType>
  extends Omit<
    PickerProps<DateType>,
    | 'value'
    | 'defaultValue'
    | 'defaultPickerValue'
    | 'onChange'
    | 'placeholder'
    | 'disabledTime'
  > {
  value?: RangeValue<DateType>;
  defaultValue?: RangeValue<DateType>;
  defaultPickerValue?: [DateType, DateType];
  placeholder?: [string, string];
  disabledTime?: (
    date: DateType | null,
    type: 'start' | 'end',
  ) => DisabledTimes;
  onChange?: (
    value: RangeValue<DateType>,
    formatString: [string, string],
  ) => void;
}

function RangePicker<DateType>(props: RangePickerProps<DateType>) {
  const {
    prefixCls = 'rc-picker',
    className,
    style,
    value,
    defaultValue,
    defaultPickerValue,
    locale,
    generateConfig,
    placeholder,
    showTime,
    disabledTime,
    format = showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD',
    onChange,
  } = props;

  const formatList = toArray(format);

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

  const value1 = mergedValue ? mergedValue[0] : null;
  const value2 = mergedValue ? mergedValue[1] : null;

  const formatDate = (date: NullableDateType<DateType>) =>
    (date
      ? generateConfig.locale.format(locale.locale, date, formatList[0])
      : '');

  const onInternalChange = (values: NullableDateType<DateType>[]) => {
    let startDate: DateType | null = values[0] || null;
    let endDate: DateType | null = values[1] || null;

    if (startDate && endDate && generateConfig.isAfter(startDate, endDate)) {
      startDate = values[1] || null;
      endDate = values[0] || null;
    }

    setInnerValue([startDate, endDate]);

    if (onChange) {
      onChange(
        [startDate, endDate],
        [formatDate(startDate), formatDate(endDate)],
      );
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

  let disabledStartTime: DisabledTime<DateType> | undefined;
  let disabledEndTime: DisabledTime<DateType> | undefined;

  if (disabledTime) {
    disabledStartTime = (date: DateType | null) => disabledTime(date, 'start');
    disabledEndTime = (date: DateType | null) => disabledTime(date, 'end');
  }

  return (
    <div className={classNames(`${prefixCls}-range`, className)} style={style}>
      <Picker<DateType>
        {...pickerProps}
        prefixCls={prefixCls}
        value={value1}
        placeholder={placeholder && placeholder[0]}
        defaultPickerValue={defaultPickerValue && defaultPickerValue[0]}
        disabledTime={disabledStartTime}
        onChange={date => {
          onInternalChange([date, value2]);
        }}
      />
      ~
      <Picker<DateType>
        {...pickerProps}
        prefixCls={prefixCls}
        value={value2}
        placeholder={placeholder && placeholder[1]}
        defaultPickerValue={defaultPickerValue && defaultPickerValue[1]}
        disabledTime={disabledEndTime}
        onChange={date => {
          onInternalChange([value1, date]);
        }}
      />
    </div>
  );
}

export default RangePicker;

import type { PickerMode, SharedTimeProps } from '../interface';
import { pickProps } from '../utils/miscUtil';

const showTimeKeys = [
  'format',
  'showNow',
  'showHour',
  'showMinute',
  'showSecond',
  'showMillisecond',
  'use12Hours',
  'hourStep',
  'minuteStep',
  'secondStep',
  'millisecondStep',
  'hideDisabledOptions',
  'defaultValue',
  'disabledHours',
  'disabledMinutes',
  'disabledSeconds',
  'disabledMilliseconds',
  'disabledTime',
  'changeOnScroll',
] as const;

/**
 * Get SharedTimeProps from props.
 */
function pickTimeProps<DateType extends object = any>(props: any): SharedTimeProps<DateType> {
  const timeProps: any = pickProps(props, showTimeKeys);

  if (timeProps.format) {
    let format = timeProps.format;
    if (Array.isArray(format)) {
      format = format[0];
    }
    timeProps.format = typeof format === 'object' ? format.format : format;
  }

  return timeProps;
}

export function getTimeConfig<DateType extends object>(
  componentProps: {
    picker?: PickerMode;
    showTime?: boolean | Partial<SharedTimeProps<DateType>>;
  } = {},
): SharedTimeProps<DateType> {
  const { showTime, picker } = componentProps;

  const isTimePicker = picker === 'time';

  if (showTime || isTimePicker) {
    const isShowTimeConfig = showTime && typeof showTime === 'object';

    const timeConfig = isShowTimeConfig ? showTime : pickTimeProps(componentProps);

    const pickedProps = pickProps(timeConfig);

    let timeFormat: string;
    if (isTimePicker) {
      timeFormat = pickedProps.format;
    } else {
      timeFormat = isShowTimeConfig && showTime.format;
    }

    return {
      ...pickedProps,
      format:
        typeof timeFormat === 'string'
          ? timeFormat
          : // Fallback to default time format instead
          pickedProps.use12Hours
          ? 'HH:mm:ss A'
          : 'HH:mm:ss',
    };
  }

  return null;
}

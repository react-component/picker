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

export function getTimeConfig<Config extends object>(
  componentProps: {
    picker?: PickerMode;
    showTime?: boolean | Config;
  } = {},
): Config {
  const { showTime, picker } = componentProps;

  if (showTime || picker === 'time') {
    const timeConfig =
      showTime && typeof showTime === 'object'
        ? showTime
        : (pickTimeProps(componentProps) as Config);

    const pickedProps = pickProps(timeConfig);

    return {
      format: (pickedProps as any).use12Hours ? 'HH:mm:ss A' : 'HH:mm:ss',
      ...pickedProps,
    };
  }

  return null;
}

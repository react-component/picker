import type { Locale, PickerMode, SharedTimeProps } from '../interface';
import { pickProps } from '../utils/miscUtil';

function checkShow(
  format: string,
  keywords: string[],
  hasOtherShowConfig: boolean,
  show?: boolean,
) {
  if (show !== undefined) {
    return show;
  }
  return (
    !hasOtherShowConfig &&
    typeof format === 'string' &&
    keywords.some((keyword) => format.includes(keyword))
  );
}

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

export function getTimeConfig<DateType extends object>(componentProps: {
  picker?: PickerMode;
  showTime?: boolean | Partial<SharedTimeProps<DateType>>;
  locale: Locale;
}): SharedTimeProps<DateType> {
  const { showTime, picker } = componentProps;

  const isTimePicker = picker === 'time';

  if (showTime || isTimePicker) {
    const isShowTimeConfig = showTime && typeof showTime === 'object';

    const timeConfig = isShowTimeConfig ? showTime : pickTimeProps(componentProps);

    const pickedProps = pickProps(timeConfig);

    // ======================== Format ========================
    let timeFormat: string;
    if (isTimePicker) {
      timeFormat = pickedProps.format;
    } else {
      timeFormat = isShowTimeConfig && showTime.format;
    }

    // ========================= Show =========================
    const { showHour, showMinute, showSecond, showMillisecond, use12Hours } = pickedProps;

    const hasShowConfig = [showHour, showMinute, showSecond, showMillisecond].some(
      (show) => show !== undefined,
    );

    let mergedShowHour = checkShow(
      timeFormat,
      ['H', 'h', 'k', 'LT', 'LLL'],
      hasShowConfig,
      showHour,
    );
    let mergedShowMinute = checkShow(timeFormat, ['m', 'LT', 'LLL'], hasShowConfig, showMinute);
    let mergedShowSecond = checkShow(timeFormat, ['s', 'LTS'], hasShowConfig, showSecond);
    const mergedShowMillisecond = checkShow(timeFormat, ['SSS'], hasShowConfig, showMillisecond);
    const mergedUse12Hours = checkShow(
      timeFormat,
      ['a', 'A', 'LT', 'LLL'],
      hasShowConfig,
      use12Hours,
    );

    // Fallback if all can not see
    if (!mergedShowHour && !mergedShowMinute && !mergedShowSecond && !mergedShowMillisecond) {
      mergedShowHour = true;
      mergedShowMinute = true;
      mergedShowSecond = true;
    }

    // ======================== Props =========================
    return {
      ...pickedProps,
      format:
        typeof timeFormat === 'string'
          ? timeFormat
          : // Fallback to default time format instead
          pickedProps.use12Hours
          ? 'HH:mm:ss A'
          : 'HH:mm:ss',

      // Show Config
      showHour: mergedShowHour,
      showMinute: mergedShowMinute,
      showSecond: mergedShowSecond,
      showMillisecond: mergedShowMillisecond,
      use12Hours: mergedUse12Hours,
    };
  }

  return null;
}

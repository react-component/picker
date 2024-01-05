import type { InternalMode, Locale, SharedPickerProps, SharedTimeProps } from '../interface';
import { getRowFormat, pickProps, toArray } from '../utils/miscUtil';

function checkShow(format: string, keywords: string[], show?: boolean) {
  return show ?? keywords.some((keyword) => format.includes(keyword));
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

function isStringFormat(format: any): format is string {
  return format && typeof format === 'string';
}

export interface ComponentProps<DateType extends object> {
  picker?: InternalMode;
  showTime?: boolean | Partial<SharedTimeProps<DateType>>;
  locale: Locale;
  format?: SharedPickerProps['format'];
}

/**
 * Get `showHour`, `showMinute`, `showSecond` or other from the props.
 * This is pure function, will not get `showXXX` from the `format` prop.
 */
export function getTimeProps<DateType extends object>(componentProps: ComponentProps<DateType>) {
  const { showTime } = componentProps;

  const isShowTimeConfig = showTime && typeof showTime === 'object';
  const timeConfig = isShowTimeConfig ? showTime : pickTimeProps(componentProps);

  const { showMillisecond } = timeConfig;
  let { showHour, showMinute, showSecond } = timeConfig;

  if (!showHour && !showMinute && !showSecond && !showMillisecond) {
    showHour = true;
    showMinute = true;
    showSecond = true;
  }

  return [
    {
      ...timeConfig,
      showHour,
      showMinute,
      showSecond,
      showMillisecond,
    },
    isShowTimeConfig,
  ] as const;
}

export function getTimeConfig<DateType extends object>(
  componentProps: ComponentProps<DateType>,
): SharedTimeProps<DateType> {
  const { showTime, picker, locale, format: propFormat } = componentProps;

  const isTimePicker = picker === 'time';

  if (showTime || isTimePicker) {
    const isShowTimeConfig = showTime && typeof showTime === 'object';

    const timeConfig = isShowTimeConfig ? showTime : pickTimeProps(componentProps);

    const pickedProps = pickProps(timeConfig);

    // ====================== BaseFormat ======================
    const showTimeFormat = isShowTimeConfig ? showTime.format : isTimePicker && propFormat;
    const defaultFormat = getRowFormat(picker, locale, null) as string;

    let baselineFormat = defaultFormat;

    const formatList = [showTimeFormat, propFormat];
    for (let i = 0; i < formatList.length; i += 1) {
      const format = toArray(formatList[i])[0];

      if (isStringFormat(format)) {
        baselineFormat = format;
        break;
      }
    }

    // ========================= Show =========================
    let { showHour, showMinute, showSecond, showMillisecond } = pickedProps;
    const { use12Hours } = pickedProps;

    const showMeridiem = checkShow(baselineFormat, ['a', 'A', 'LT', 'LLL'], use12Hours);

    const hasShowConfig = [showHour, showMinute, showSecond, showMillisecond].some(
      (show) => show !== undefined,
    );

    // Fill with format, if needed
    if (!hasShowConfig) {
      showHour = checkShow(baselineFormat, ['H', 'h', 'k', 'LT', 'LLL']);
      showMinute = checkShow(baselineFormat, ['m', 'LT', 'LLL']);
      showSecond = checkShow(baselineFormat, ['s', 'LTS']);
      showMillisecond = checkShow(baselineFormat, ['SSS']);
    }

    // Fallback if all can not see
    if (!hasShowConfig && !showHour && !showMinute && !showSecond && !showMillisecond) {
      showHour = true;
      showMinute = true;
      showSecond = true;
    }

    // ======================== Format ========================
    let timeFormat = isStringFormat(showTimeFormat) ? showTimeFormat : null;

    if (!timeFormat) {
      timeFormat = '';

      // Base HH:mm:ss
      const cells = [];

      if (showHour) {
        cells.push('HH');
      }
      if (showMinute) {
        cells.push('mm');
      }
      if (showSecond) {
        cells.push('ss');
      }

      timeFormat = cells.join(':');

      // Millisecond
      if (showMillisecond) {
        timeFormat += '.SSS';
      }

      // Meridiem
      if (showMeridiem) {
        timeFormat += ' A';
      }
    }

    // ======================== Props =========================
    return {
      ...pickedProps,

      // Format
      format: timeFormat,

      // Show Config
      showHour,
      showMinute,
      showSecond,
      showMillisecond,
      use12Hours: showMeridiem,
    };
  }

  return null;
}

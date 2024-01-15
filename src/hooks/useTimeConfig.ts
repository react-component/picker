import type { InternalMode, Locale, SharedPickerProps, SharedTimeProps } from '../interface';
import { getRowFormat, pickProps, toArray } from '../utils/miscUtil';
import { fillTimeFormat } from './useLocale';

function checkShow(format: string, keywords: string[], show?: boolean) {
  return show ?? keywords.some((keyword) => format.includes(keyword));
}

const showTimeKeys = [
  // 'format',
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
function pickTimeProps<DateType extends object = any>(
  props: any,
): [timeProps: SharedTimeProps<DateType>, propFormat: string] {
  const timeProps: any = pickProps(props, showTimeKeys);
  const { format, picker } = props;

  let propFormat: typeof format = null;
  if (format) {
    propFormat = format;

    if (Array.isArray(propFormat)) {
      propFormat = propFormat[0];
    }
    propFormat = typeof propFormat === 'object' ? propFormat.format : propFormat;
  }

  if (picker === 'time') {
    timeProps.format = propFormat;
  }

  return [timeProps, propFormat];
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
export function getTimeProps<DateType extends object>(
  componentProps: ComponentProps<DateType>,
): [
  showTimeProps: SharedTimeProps<DateType>,
  showTimePropsForLocale: SharedTimeProps<DateType>,
  showTimeFormat: string,
  propFormat: string,
] {
  const { showTime } = componentProps;

  const [pickedProps, propFormat] = pickTimeProps(componentProps);

  const showTimeConfig = showTime && typeof showTime === 'object' ? showTime : {};
  const timeConfig = {
    ...pickedProps,
    ...showTimeConfig,
  };

  const { showMillisecond } = timeConfig;
  let { showHour, showMinute, showSecond } = timeConfig;

  if (!showHour && !showMinute && !showSecond && !showMillisecond) {
    showHour = true;
    showMinute = true;
    showSecond = true;
  }

  return [
    timeConfig,
    {
      ...timeConfig,
      showHour,
      showMinute,
      showSecond,
      showMillisecond,
    },
    timeConfig.format,
    propFormat,
  ];
}

export function fillShowTimeConfig<DateType extends object>(
  picker: InternalMode,
  showTimeFormat: string,
  propFormat: string,
  timeConfig: SharedTimeProps<DateType>,
  locale: Locale,
): SharedTimeProps<DateType> {
  const isTimePicker = picker === 'time';

  if (picker === 'datetime' || isTimePicker) {
    const pickedProps = timeConfig;

    // ====================== BaseFormat ======================
    const defaultLocaleFormat = getRowFormat(picker, locale, null) as string;

    let baselineFormat = defaultLocaleFormat;

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

    const showMeridiem = checkShow(baselineFormat, ['a', 'A', 'LT', 'LLL', 'LTS'], use12Hours);

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
    const timeFormat =
      showTimeFormat ||
      fillTimeFormat(showHour, showMinute, showSecond, showMillisecond, showMeridiem);

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

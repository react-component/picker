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

export function getTimeConfig<DateType extends object>(componentProps: {
  picker?: InternalMode;
  showTime?: boolean | Partial<SharedTimeProps<DateType>>;
  locale: Locale;
  format?: SharedPickerProps['format'];
}): SharedTimeProps<DateType> {
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

      if (format && typeof format === 'string') {
        baselineFormat = format;
        break;
      }
    }

    // ========================= Show =========================
    let { showHour, showMinute, showSecond, showMillisecond } = pickedProps;
    const { use12Hours } = pickedProps;

    const showMeridiem = checkShow(baselineFormat, ['a', 'A', 'LT', 'LLL'], use12Hours);

    // Fill with format, if needed
    if ([showHour, showMinute, showSecond, showMillisecond].every((show) => show === undefined)) {
      showHour = checkShow(baselineFormat, ['H', 'h', 'k', 'LT', 'LLL']);
      showMinute = checkShow(baselineFormat, ['m', 'LT', 'LLL']);
      showSecond = checkShow(baselineFormat, ['s', 'LTS']);
      showMillisecond = checkShow(baselineFormat, ['SSS']);
    }

    // Fallback if all can not see
    if (!showHour && !showMinute && !showSecond && !showMillisecond) {
      showHour = true;
      showMinute = true;
      showSecond = true;
    }

    // let timeFormat: string;
    // if (isTimePicker) {
    //   timeFormat = pickedProps.format;
    // } else {
    //   timeFormat = isShowTimeConfig && showTime.format;
    // }

    // let rootFormat = getRowFormat(picker, locale, null);
    // if (timeFormat) {}

    // ========================= Show =========================
    // const { showHour, showMinute, showSecond, showMillisecond, use12Hours } = pickedProps;

    // const hasShowConfig = [showHour, showMinute, showSecond, showMillisecond].some(
    //   (show) => show !== undefined,
    // );

    // let mergedShowHour = checkShow(
    //   timeFormat,
    //   ['H', 'h', 'k', 'LT', 'LLL'],
    //   hasShowConfig,
    //   showHour,
    // );
    // let mergedShowMinute = checkShow(timeFormat, ['m', 'LT', 'LLL'], hasShowConfig, showMinute);
    // let mergedShowSecond = checkShow(timeFormat, ['s', 'LTS'], hasShowConfig, showSecond);
    // const mergedShowMillisecond = checkShow(timeFormat, ['SSS'], hasShowConfig, showMillisecond);
    // const mergedUse12Hours = checkShow(
    //   timeFormat,
    //   ['a', 'A', 'LT', 'LLL'],
    //   hasShowConfig,
    //   use12Hours,
    // );

    // // Fallback if all can not see
    // if (!mergedShowHour && !mergedShowMinute && !mergedShowSecond && !mergedShowMillisecond) {
    //   mergedShowHour = true;
    //   mergedShowMinute = true;
    //   mergedShowSecond = true;
    // }

    // ======================== Props =========================
    return {
      ...pickedProps,
      format:
        typeof baselineFormat === 'string'
          ? baselineFormat
          : // Fallback to default time format instead
          pickedProps.use12Hours
          ? 'HH:mm:ss A'
          : 'HH:mm:ss',

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

import { useEvent } from 'rc-util';
import type { GenerateConfig } from '../../../generate';
import type { PanelMode, SharedPickerProps, SharedTimeProps } from '../../interface';

/**
 * Check if provided date is valid for the `disabledDate` & `showTime.disabledTime`.
 */
export default function useInvalidate<DateType = any>(
  generateConfig: GenerateConfig<DateType>,
  picker: PanelMode,
  disabledDate?: SharedPickerProps<DateType>['disabledDate'],
  showTime?: SharedTimeProps<DateType>,
) {
  // Check disabled date
  const isInvalidate = useEvent((date: DateType) => {
    if (disabledDate && disabledDate(date, { type: picker })) {
      return true;
    }

    if (picker === 'date' && showTime) {
      const { disabledHours, disabledMinutes, disabledSeconds, disabledMilliSeconds } =
        showTime.disabledTime?.(date) || {};

      const hour = generateConfig.getHour(date);
      const minute = generateConfig.getMinute(date);
      const second = generateConfig.getSecond(date);
      const millisecond = generateConfig.getMillisecond(date);

      if (disabledHours && disabledHours().includes(hour)) {
        return true;
      }

      if (disabledMinutes && disabledMinutes(hour).includes(minute)) {
        return true;
      }

      if (disabledSeconds && disabledSeconds(hour, minute).includes(second)) {
        return true;
      }

      if (
        disabledMilliSeconds &&
        disabledMilliSeconds(hour, minute, second).includes(millisecond)
      ) {
        return true;
      }
    }
    return false;
  });

  return isInvalidate;
}

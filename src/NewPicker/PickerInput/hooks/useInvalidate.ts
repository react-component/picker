import { useEvent } from 'rc-util';
import type { GenerateConfig } from '../../../generate';
import type {
  PanelMode,
  RangeTimeProps,
  SharedPickerProps,
  SharedTimeProps,
} from '../../interface';

/**
 * Check if provided date is valid for the `disabledDate` & `showTime.disabledTime`.
 */
export default function useInvalidate<DateType extends object = any>(
  generateConfig: GenerateConfig<DateType>,
  picker: PanelMode,
  disabledDate?: SharedPickerProps<DateType>['disabledDate'],
  showTime?: SharedTimeProps<DateType> | RangeTimeProps<DateType>,
) {
  // Check disabled date
  const isInvalidate = useEvent((date: DateType) => {
    if (
      // Date object is invalid
      !generateConfig.isValidate(date) ||
      // Date is disabled by `disabledDate`
      (disabledDate && disabledDate(date, { type: picker }))
    ) {
      return true;
    }

    if ((picker === 'date' || picker === 'time') && showTime) {
      const { disabledHours, disabledMinutes, disabledSeconds, disabledMilliSeconds } =
        showTime.disabledTime?.(date) || {};

      const {
        disabledHours: legacyDisabledHours,
        disabledMinutes: legacyDisabledMinutes,
        disabledSeconds: legacyDisabledSeconds,
      } = showTime;

      const mergedDisabledHours = disabledHours || legacyDisabledHours;
      const mergedDisabledMinutes = disabledMinutes || legacyDisabledMinutes;
      const mergedDisabledSeconds = disabledSeconds || legacyDisabledSeconds;

      const hour = generateConfig.getHour(date);
      const minute = generateConfig.getMinute(date);
      const second = generateConfig.getSecond(date);
      const millisecond = generateConfig.getMillisecond(date);

      if (mergedDisabledHours && mergedDisabledHours().includes(hour)) {
        return true;
      }

      if (mergedDisabledMinutes && mergedDisabledMinutes(hour).includes(minute)) {
        return true;
      }

      if (mergedDisabledSeconds && mergedDisabledSeconds(hour, minute).includes(second)) {
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

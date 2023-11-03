import type { SharedTimeProps } from '../interface';

export default function useShowTime<DateType = any>(
  showTime?: boolean | SharedTimeProps<DateType>,
) {
  if (showTime === true) {
    return {};
  }

  return showTime || null;
}

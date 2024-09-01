import type { SharedPickerProps } from '../interface';
import { pickProps } from '../utils/miscUtil';

export function pickTriggerProps(props: Omit<SharedPickerProps, 'showTime'>) {
  return pickProps(props, [
    'placement',
    'builtinPlacements',
    'popupAlign',
    'getPopupContainer',
    'transitionName',
    'direction',
  ]);
}

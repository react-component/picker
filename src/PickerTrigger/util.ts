import type { SharedPickerProps } from '../interface';
import { pickProps } from '../utils/miscUtil';

export function pickTriggerProps(props: SharedPickerProps) {
  return pickProps(props, [
    'placement',
    'builtinPlacements',
    'popupAlign',
    'getPopupContainer',
    'transitionName',
    'direction',
  ]);
}

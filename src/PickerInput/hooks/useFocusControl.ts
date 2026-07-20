import { useEvent } from '@rc-component/util';
import type * as React from 'react';

// ============================= Types =============================
/** Focus event source. / 焦点事件来源。 */
export type FocusSource = 'input' | 'panel';

/** Focus state change type. / 焦点状态变更类型。 */
export type FocusChangeType = 'focus' | 'blur';

/** React focus event used by Picker elements. / Picker 元素使用的 React 焦点事件。 */
export type PickerFocusEvent = React.FocusEvent<HTMLElement>;

/** Focus event handler. / 聚焦事件处理函数。 */
export type FieldFocusHandler = (
  index: number,
  source: FocusSource,
  event: PickerFocusEvent,
) => void;

/** Blur event handler. / 失焦事件处理函数。 */
export type FieldBlurHandler = (
  index: number,
  source: FocusSource,
  event: PickerFocusEvent,
) => void;

/** Check whether an element belongs to the Picker. / 检查元素是否属于 Picker。 */
export type IsPickerElement = (element: EventTarget | null) => boolean;

/** Notify the final focus state change. / 通知最终确认的焦点状态变更。 */
export type TriggerFocusChange = (index: number, type: FocusChangeType) => void;

/** Notify a Picker focus or blur event. / 通知 Picker 的聚焦或失焦事件。 */
export type FocusEventHandler = (index: number, event: PickerFocusEvent) => void;

export type UseFocusControlReturn = [
  onFieldFocus: FieldFocusHandler,
  onFieldBlur: FieldBlurHandler,
];

// ============================= Utils =============================
/** Check whether the target is the container itself or inside it. / 判断目标是否为容器自身或其子元素。 */
function containsElement(container: HTMLElement | null, target: EventTarget | null) {
  return !!container && (container === target || container.contains(target as Node));
}

/** Check whether the target belongs to the selector or popup. / 判断目标是否属于输入区域或弹出区域。 */
export function isPickerElement(
  target: EventTarget | null,
  selectorElement: HTMLElement | null,
  popupElement: HTMLElement | null,
) {
  return containsElement(selectorElement, target) || containsElement(popupElement, target);
}

/**
 * Control field focus and blur events.
 * 控制 field 的聚焦与失焦事件。
 *
 * Ignore blur when `relatedTarget` still belongs to the Picker.
 * 当 `relatedTarget` 仍属于 Picker 时，忽略本次 blur。
 */
export default function useFocusControl(
  isPickerElement: IsPickerElement,
  triggerFocusChange: TriggerFocusChange,
  onFocus?: FocusEventHandler,
  onBlur?: FocusEventHandler,
): UseFocusControlReturn {
  const onFieldFocus = useEvent((index: number, _source: FocusSource, event: PickerFocusEvent) => {
    triggerFocusChange(index, 'focus');
    onFocus?.(index, event);
  });

  const onFieldBlur = useEvent((index: number, _source: FocusSource, event: PickerFocusEvent) => {
    if (!isPickerElement(event.relatedTarget)) {
      triggerFocusChange(index, 'blur');
      onBlur?.(index, event);
    }
  });

  return [onFieldFocus, onFieldBlur];
}

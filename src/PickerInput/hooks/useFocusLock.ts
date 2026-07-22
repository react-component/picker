import { useEvent, useLayoutEffect } from '@rc-component/util';
import * as React from 'react';
import { isTargetInContainers } from './useFocusEvents';

interface FocusLockSelectorRef {
  startInput: HTMLElement;
  endInput: HTMLElement;
  focus: (index?: number) => void;
}

/**
 * Keep focus on the specified input field while focus moves inside the Picker.
 * 当焦点在 Picker 内移动时，将其锁定在指定的输入框上。
 */
export default function useFocusLock(
  index: number | null,
  selectorRef: React.RefObject<FocusLockSelectorRef | null>,
  popupRef: React.RefObject<HTMLElement | null>,
  triggerOpen: (open: boolean) => void,
) {
  const openPicker = useEvent(() => {
    triggerOpen(true);
  });

  // Open the Picker and focus the controlled field after it changes.
  // 当受控 field 发生切换后，重新打开 Picker 并聚焦对应的 field。
  React.useEffect(() => {
    if (index !== null) {
      openPicker();
      selectorRef.current?.focus(index);
    }
  }, [index, openPicker]);

  // DOM focus may change while `index` stays the same, so check after every commit.
  // DOM 焦点变化时 `index` 可能保持不变，因此每次 commit 后都需要检查。
  useLayoutEffect(() => {
    if (index === null) {
      return;
    }

    const activeElement = document.activeElement;
    const inputFields = [selectorRef.current?.startInput, selectorRef.current?.endInput];

    if (isTargetInContainers(activeElement, [popupRef.current])) {
      return;
    }

    const focusInOtherField = inputFields.some(
      (field, fieldIndex) => fieldIndex !== index && isTargetInContainers(activeElement, [field]),
    );

    if (focusInOtherField) {
      inputFields[index]?.focus();
    }
  });
}

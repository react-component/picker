import * as React from 'react';
import type { PickerRef } from '../../interface';

type PickerRefType<OptionType> = Omit<PickerRef, 'focus'> & {
  focus: (options?: OptionType) => void;
};

export default function usePickerRef<OptionType>(ref: React.Ref<PickerRefType<OptionType>>) {
  const selectorRef = React.useRef<PickerRefType<OptionType>>();

  React.useImperativeHandle(ref, () => ({
    nativeElement: selectorRef.current?.nativeElement,
    focus: (options) => {
      selectorRef.current?.focus(options);
    },
    blur: () => {
      selectorRef.current?.blur();
    },
  }));

  return selectorRef;
}

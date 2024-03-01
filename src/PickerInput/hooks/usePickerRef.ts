import * as React from 'react';
import type { PickerRef } from '../../interface';

type BaseRefType = Omit<PickerRef, 'focus'>;
type Focus<OptionType> = (options?: OptionType) => void;
type PickerRefType<OptionType> = BaseRefType & {
  focus: Focus<OptionType>;
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

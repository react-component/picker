import * as React from 'react';
import type { PickerRef, RangePickerRef } from '../../interface';

export function usePickerRef(ref: React.Ref<PickerRef>) {
  const selectorRef = React.useRef<PickerRef>();

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

export function useRangePickerRef(ref: React.Ref<RangePickerRef>) {
  const selectorRef = React.useRef<RangePickerRef>();

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

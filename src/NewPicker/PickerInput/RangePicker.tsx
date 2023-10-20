import * as React from 'react';
import { PrefixClsContext } from './context';
import type { SharedPickerProps } from './interface';
import RangeSelector from './Selector/RangeSelector';

export type RangePickerProps = SharedPickerProps;

export default function Picker(props: RangePickerProps) {
  const { prefixCls = 'rc-picker', className, style, suffixIcon } = props;

  return (
    <PrefixClsContext.Provider value={prefixCls}>
      <RangeSelector suffixIcon={suffixIcon} />
    </PrefixClsContext.Provider>
  );
}

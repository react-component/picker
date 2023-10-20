import * as React from 'react';
import { PrefixClsContext } from '../context';
import type { SelectorProps, SelectorRef } from '../interface';
import Icon from './Icon';
import Input from './Input';

export interface RangeSelectorProps extends SelectorProps {
  separator?: React.ReactNode;
}

const RangeSelector = React.forwardRef<SelectorRef, RangeSelectorProps>((props, ref) => {
  const { suffixIcon, separator = '~' } = props;

  const prefixCls = React.useContext(PrefixClsContext);

  return (
    <div className={prefixCls}>
      <Input />
      <div className={`${prefixCls}-range-separator`}>{separator}</div>
      <Input />
      <Icon type="suffix" icon={suffixIcon} />
    </div>
  );
});

if (process.env.NODE_ENV !== 'production') {
  RangeSelector.displayName = 'RangeSelector';
}

export default RangeSelector;

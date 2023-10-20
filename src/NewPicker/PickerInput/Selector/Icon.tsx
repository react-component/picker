import * as React from 'react';
import { PrefixClsContext } from '../context';

export interface IconProps {
  icon?: React.ReactNode;
  type: 'suffix' | 'clear';
}

export default function Icon(props: IconProps) {
  const { icon, type } = props;

  const prefixCls = React.useContext(PrefixClsContext);

  return icon ? <span className={`${prefixCls}-${type}`}>{icon}</span> : null;
}

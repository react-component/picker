import * as React from 'react';
import { PrefixClsContext } from '../context';
import Icon from './Icon';

export interface InputProps extends React.HTMLAttributes<HTMLInputElement> {
  suffixIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { suffixIcon, ...restProps } = props;

  const prefixCls = React.useContext(PrefixClsContext);

  return (
    <div className={`${prefixCls}-input`}>
      <input ref={ref} {...restProps} />
      <Icon type="suffix" icon={suffixIcon} />
    </div>
  );
});

if (process.env.NODE_ENV !== 'production') {
  Input.displayName = 'Input';
}

export default Input;

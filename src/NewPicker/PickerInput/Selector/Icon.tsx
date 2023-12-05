import * as React from 'react';
import PickerContext from '../context';

export interface IconProps extends React.HtmlHTMLAttributes<HTMLElement> {
  icon?: React.ReactNode;
  type: 'suffix' | 'clear';
}

export default function Icon(props: IconProps) {
  const { icon, type, ...restProps } = props;

  const { prefixCls } = React.useContext(PickerContext);

  return icon ? (
    <span className={`${prefixCls}-${type}`} {...restProps}>
      {icon}
    </span>
  ) : null;
}

export interface ClearIconProps extends Omit<IconProps, 'type'> {
  onClear: VoidFunction;
}

export function ClearIcon({ onClear, ...restProps }: ClearIconProps) {
  return (
    <Icon
      {...restProps}
      type="clear"
      role="button"
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClear();
      }}
    />
  );
}

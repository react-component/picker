import * as React from 'react';
import PickerContext from '../context';
import { clsx } from 'clsx';

export interface IconProps extends React.HtmlHTMLAttributes<HTMLElement> {
  icon?: React.ReactNode;
}

export default function Icon({ icon, ...restProps }: IconProps) {
  const { prefixCls, classNames, styles } = React.useContext(PickerContext);

  return icon ? (
    <span
      className={clsx(`${prefixCls}-suffix`, classNames.suffix)}
      style={styles.suffix}
      {...restProps}
    >
      {icon}
    </span>
  ) : null;
}

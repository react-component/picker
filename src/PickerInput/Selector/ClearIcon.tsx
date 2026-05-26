import * as React from 'react';
import PickerContext from '../context';
import { clsx } from 'clsx';

export interface ClearIconProps extends React.HtmlHTMLAttributes<HTMLElement> {
  icon?: React.ReactNode;
  onClear: VoidFunction;
}

export default function ClearIcon({ icon, onClear, ...restProps }: ClearIconProps) {
  const { prefixCls, classNames, styles, locale } = React.useContext(PickerContext);

  return (
    <button
      {...restProps}
      type="button"
      aria-label={locale.clear}
      className={clsx(`${prefixCls}-clear`, classNames.suffix)}
      style={styles.suffix}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClear();
      }}
    >
      {icon}
    </button>
  );
}

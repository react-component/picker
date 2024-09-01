import warning from 'rc-util/lib/warning';
import type { ReactNode } from 'react';
import * as React from 'react';

/**
 * Used for `useFilledProps` since it already in the React.useMemo
 */
export function fillClearIcon(
  prefixCls: string,
  allowClear?: boolean | { clearIcon?: ReactNode },
  clearIcon?: ReactNode,
) {
  if (process.env.NODE_ENV !== 'production' && clearIcon) {
    warning(false, '`clearIcon` will be removed in future. Please use `allowClear` instead.');
  }

  if (allowClear === false) {
    return null;
  }

  const config = allowClear && typeof allowClear === 'object' ? allowClear : {};

  return config.clearIcon || clearIcon || <span className={`${prefixCls}-clear-btn`} />;
}


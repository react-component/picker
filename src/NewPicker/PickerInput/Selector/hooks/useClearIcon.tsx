import type { ReactNode } from 'react';
import * as React from 'react';

export function useClearIcon(
  prefixCls: string,
  allowClear?: boolean | { clearIcon?: ReactNode },
  clearIcon?: ReactNode,
) {
  const mergedClearIcon = React.useMemo(() => {
    if (allowClear === false) {
      return null;
    }

    const config = allowClear && typeof allowClear === 'object' ? allowClear : {};

    return config.clearIcon || clearIcon || <span className={`${prefixCls}-clear-btn`} />;
  }, [prefixCls, allowClear, clearIcon]);

  return mergedClearIcon;
}

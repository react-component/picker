import { type AllowClearConfig, isReactRenderable, warning } from '@rc-component/util';
import type { ReactNode } from 'react';
import * as React from 'react';

/**
 * Used for `useFilledProps` since it already in the React.useMemo
 */
export function fillClearIcon(prefixCls: string, config: AllowClearConfig, clearIcon?: ReactNode) {
  if (process.env.NODE_ENV !== 'production' && isReactRenderable(clearIcon)) {
    warning(false, '`clearIcon` will be removed in future. Please use `allowClear` instead.');
  }

  if (config.disabled) {
    return null;
  }

  if (isReactRenderable(config.clearIcon)) {
    return config.clearIcon;
  }

  return isReactRenderable(clearIcon) ? clearIcon : <span className={`${prefixCls}-clear-btn`} />;
}

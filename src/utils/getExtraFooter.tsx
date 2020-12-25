import * as React from 'react';
import type { PanelMode } from '../interface';

export default function getExtraFooter(
  prefixCls: string,
  mode: PanelMode,
  renderExtraFooter?: (mode: PanelMode) => React.ReactNode,
) {
  if (!renderExtraFooter) {
    return null;
  }

  return (
    <div className={`${prefixCls}-footer-extra`}>{renderExtraFooter(mode)}</div>
  );
}

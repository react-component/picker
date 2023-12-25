import * as React from 'react';
import { PickerHackContext, usePanelContext } from './context';

const HIDDEN_STYLE: React.CSSProperties = {
  visibility: 'hidden',
};

export interface HeaderProps {
  onOffset?: (offset: number) => void;
  onSuperOffset?: (offset: number) => void;

  children?: React.ReactNode;
}

function PanelHeader<DateType extends object>(props: HeaderProps) {
  const {
    onOffset,
    onSuperOffset,

    children,
  } = props;

  const {
    prefixCls,

    // Icons
    prevIcon = '\u2039',
    nextIcon = '\u203A',
    superPrevIcon = '\u00AB',
    superNextIcon = '\u00BB',
  } = usePanelContext<DateType>();

  const headerPrefixCls = `${prefixCls}-header`;

  const { hidePrev, hideNext } = React.useContext(PickerHackContext);

  return (
    <div className={headerPrefixCls}>
      {onSuperOffset && (
        <button
          type="button"
          onClick={() => onSuperOffset(-1)}
          tabIndex={-1}
          className={`${headerPrefixCls}-super-prev-btn`}
          style={hidePrev ? HIDDEN_STYLE : {}}
        >
          {superPrevIcon}
        </button>
      )}
      {onOffset && (
        <button
          type="button"
          onClick={() => onOffset(-1)}
          tabIndex={-1}
          className={`${headerPrefixCls}-prev-btn`}
          style={hidePrev ? HIDDEN_STYLE : {}}
        >
          {prevIcon}
        </button>
      )}
      <div className={`${headerPrefixCls}-view`}>{children}</div>
      {onOffset && (
        <button
          type="button"
          onClick={() => onOffset(1)}
          tabIndex={-1}
          className={`${headerPrefixCls}-next-btn`}
          style={hideNext ? HIDDEN_STYLE : {}}
        >
          {nextIcon}
        </button>
      )}
      {onSuperOffset && (
        <button
          type="button"
          onClick={() => onSuperOffset(1)}
          tabIndex={-1}
          className={`${headerPrefixCls}-super-next-btn`}
          style={hideNext ? HIDDEN_STYLE : {}}
        >
          {superNextIcon}
        </button>
      )}
    </div>
  );
}

export default PanelHeader;

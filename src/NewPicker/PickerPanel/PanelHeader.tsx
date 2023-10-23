import * as React from 'react';
import { PanelContext } from './context';

const HIDDEN_STYLE: React.CSSProperties = {
  visibility: 'hidden',
};

export interface HeaderProps {
  // Icons
  prevIcon?: React.ReactNode;
  nextIcon?: React.ReactNode;
  superPrevIcon?: React.ReactNode;
  superNextIcon?: React.ReactNode;
  // /** Last one step */
  // onPrev?: () => void;
  // /** Next one step */
  // onNext?: () => void;
  // /** Last multiple steps */
  // onSuperPrev?: () => void;
  // /** Next multiple steps */
  // onSuperNext?: () => void;

  onOffset?: (offset: number) => void;
  onSuperOffset?: (offset: number) => void;

  children?: React.ReactNode;
}

function PanelHeader(props: HeaderProps) {
  const {
    onOffset,
    onSuperOffset,

    // Icons
    prevIcon = '\u2039',
    nextIcon = '\u203A',
    superPrevIcon = '\u00AB',
    superNextIcon = '\u00BB',

    children,
  } = props;

  const { prefixCls } = React.useContext(PanelContext);

  const headerPrefixCls = `${prefixCls}-header`;

  // const {
  //   prefixCls,

  //   onSuperPrev,
  //   onSuperNext,
  //   onPrev,
  //   onNext,
  //   children,
  // } = props;
  // const { hideNextBtn, hidePrevBtn } = React.useContext(PanelContext);

  return (
    <div className={headerPrefixCls}>
      {onSuperOffset && (
        <button
          type="button"
          onClick={() => onSuperOffset(-1)}
          tabIndex={-1}
          className={`${headerPrefixCls}-super-prev-btn`}
          // style={hidePrevBtn ? HIDDEN_STYLE : {}}
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
          // style={hidePrevBtn ? HIDDEN_STYLE : {}}
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
          // style={hideNextBtn ? HIDDEN_STYLE : {}}
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
          // style={hideNextBtn ? HIDDEN_STYLE : {}}
        >
          {superNextIcon}
        </button>
      )}
    </div>
  );
}

export default PanelHeader;

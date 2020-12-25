import * as React from 'react';
import PanelContext from '../PanelContext';

const HIDDEN_STYLE: React.CSSProperties = {
  visibility: 'hidden',
};

export type HeaderProps = {
  prefixCls: string;

  // Icons
  prevIcon?: React.ReactNode;
  nextIcon?: React.ReactNode;
  superPrevIcon?: React.ReactNode;
  superNextIcon?: React.ReactNode;

  /** Last one step */
  onPrev?: () => void;
  /** Next one step */
  onNext?: () => void;
  /** Last multiple steps */
  onSuperPrev?: () => void;
  /** Next multiple steps */
  onSuperNext?: () => void;

  children?: React.ReactNode;
};

function Header({
  prefixCls,
  prevIcon = '\u2039',
  nextIcon = '\u203A',
  superPrevIcon = '\u00AB',
  superNextIcon = '\u00BB',
  onSuperPrev,
  onSuperNext,
  onPrev,
  onNext,
  children,
}: HeaderProps) {
  const { hideNextBtn, hidePrevBtn } = React.useContext(PanelContext);

  return (
    <div className={prefixCls}>
      {onSuperPrev && (
        <button
          type="button"
          onClick={onSuperPrev}
          tabIndex={-1}
          className={`${prefixCls}-super-prev-btn`}
          style={hidePrevBtn ? HIDDEN_STYLE : {}}
        >
          {superPrevIcon}
        </button>
      )}
      {onPrev && (
        <button
          type="button"
          onClick={onPrev}
          tabIndex={-1}
          className={`${prefixCls}-prev-btn`}
          style={hidePrevBtn ? HIDDEN_STYLE : {}}
        >
          {prevIcon}
        </button>
      )}
      <div className={`${prefixCls}-view`}>{children}</div>
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          tabIndex={-1}
          className={`${prefixCls}-next-btn`}
          style={hideNextBtn ? HIDDEN_STYLE : {}}
        >
          {nextIcon}
        </button>
      )}
      {onSuperNext && (
        <button
          type="button"
          onClick={onSuperNext}
          tabIndex={-1}
          className={`${prefixCls}-super-next-btn`}
          style={hideNextBtn ? HIDDEN_STYLE : {}}
        >
          {superNextIcon}
        </button>
      )}
    </div>
  );
}

export default Header;

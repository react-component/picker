import * as React from 'react';

export interface HeaderProps {
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
}

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
  return (
    <div className={prefixCls}>
      {onSuperPrev && (
        <button
          type="button"
          onClick={onSuperPrev}
          tabIndex={-1}
          className={`${prefixCls}-super-prev-btn`}
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
        >
          {superNextIcon}
        </button>
      )}
    </div>
  );
}

export default Header;

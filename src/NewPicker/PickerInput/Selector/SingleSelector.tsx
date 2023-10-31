import classNames from 'classnames';
import * as React from 'react';
import type { SelectorProps, SelectorRef } from '../../interface';
import PickerContext from '../context';
import Input from './Input';

const SingleSelector = React.forwardRef<SelectorRef, SelectorProps>((props, ref) => {
  const {
    suffixIcon,

    // Style
    className,
    style,

    // Focus
    focused,
    onFocus,
    onBlur,
  } = props;

  const { prefixCls } = React.useContext(PickerContext);

  // ============================= Refs =============================
  const rootRef = React.useRef<HTMLDivElement>();
  const inputRef = React.useRef<HTMLInputElement>();

  React.useImperativeHandle(ref, () => ({
    nativeElement: rootRef.current,
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
  }));

  // ============================ Render ============================
  return (
    <div
      ref={rootRef}
      className={classNames(prefixCls, focused && `${prefixCls}-focused`, className)}
      style={style}
    >
      <Input ref={inputRef} suffixIcon={suffixIcon} onFocus={onFocus} onBlur={onBlur} />
    </div>
  );
});

if (process.env.NODE_ENV !== 'production') {
  SingleSelector.displayName = 'SingleSelector';
}

export default SingleSelector;

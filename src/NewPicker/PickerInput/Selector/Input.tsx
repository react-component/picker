import classNames from 'classnames';
import { useComposeRef } from 'rc-util';
import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import * as React from 'react';
import { PrefixClsContext } from '../context';
import Icon from './Icon';
import { getCellRange, getMask, matchFormat } from './util';

// Format logic
//
// First time on focus:
//  1. check if the text is valid, if not fill with format
//  2. set highlight cell to the first cell
// Cells
//  1. Selection the index cell, set inner `cacheValue` to ''
//  2. Key input filter non-number char, patch after the `cacheValue`
//    1. Replace the `cacheValue` with input align the cell length
//    2. Re-selection the mask cell
//  3. If `cacheValue` match the limit length or cell format (like 1 ~ 12 month), go to next cell

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  format?: string;
  validateFormat: (value: string, format: string) => boolean;
  active?: boolean;
  suffixIcon?: React.ReactNode;
  value?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { active, suffixIcon, format, validateFormat, onFocus, onBlur, value, ...restProps } =
    props;

  const prefixCls = React.useContext(PrefixClsContext);
  const inputPrefixCls = `${prefixCls}-input`;

  // ======================== Value =========================
  const [focused, setFocused] = React.useState(false);
  const [focusValue, setFocusValue] = React.useState<string>(value || '');
  const [focusCellIndex, setFocusCellIndex] = React.useState<number>(null);

  // ========================= Refs =========================
  const inputRef = React.useRef<HTMLInputElement>();

  const mergedRef = useComposeRef(ref, inputRef);

  // ====================== Focus Blur ======================
  const onInternalFocus: React.FocusEventHandler<HTMLInputElement> = (event) => {
    onFocus(event);

    // if (!focusValue) {
    //   setFocusValue(format);
    // }

    setFocused(true);
    setFocusCellIndex(0);
  };

  const onInternalBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    onBlur(event);

    // setFocusValue(value || '');

    setFocused(false);
    setFocusCellIndex(null);
  };

  const onInternalChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setFocusValue(event.target.value);
  };

  const inputProps: React.InputHTMLAttributes<HTMLInputElement> = format
    ? {
        value: focusValue,
        onFocus: onInternalFocus,
        onBlur: onInternalBlur,
        onChange: onInternalChange,
      }
    : {};

  // ======================== Format ========================

  useLayoutEffect(() => {
    if (!focused || focusCellIndex === null || !format) {
      return;
    }

    const maskFormat = getMask(format);
    console.log('>', maskFormat);

    // Reset with format if not match
    if (!matchFormat(maskFormat, focusValue)) {
      // flushSync(() => {
      setFocusValue(format);
      // });
      return;
    }

    // Match the selection range
    const [selectionStart, selectionEnd] = getCellRange(maskFormat, focusCellIndex);
    console.log('MMM!', selectionStart, selectionEnd);

    // alignFormat(format, focusValue);

    // const formatCells = format.split(/[^A-Za-z]+/);

    // // Realign selection by the format cells
    // console.log(inputRef.current.selectionStart, focusValue);
  }, [format, focused, focusValue, focusCellIndex]);

  // ======================== Render ========================
  return (
    <div
      className={classNames(inputPrefixCls, {
        [`${inputPrefixCls}-active`]: active,
      })}
    >
      <input ref={mergedRef} {...restProps} {...inputProps} />
      <Icon type="suffix" icon={suffixIcon} />
    </div>
  );
});

if (process.env.NODE_ENV !== 'production') {
  Input.displayName = 'Input';
}

export default Input;

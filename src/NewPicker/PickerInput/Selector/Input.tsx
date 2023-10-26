import classNames from 'classnames';
import { useComposeRef } from 'rc-util';
// import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import raf from 'rc-util/lib/raf';
import * as React from 'react';
import { leftPad } from '../../../utils/miscUtil';
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
  const {
    active,
    suffixIcon,
    format,
    validateFormat,
    // Pass to input
    ...restProps
  } = props;
  const { value, onFocus, onBlur, onKeyDown } = props;

  const prefixCls = React.useContext(PrefixClsContext);
  const inputPrefixCls = `${prefixCls}-input`;

  // ======================== Value =========================
  const [focused, setFocused] = React.useState(false);
  const [focusValue, setFocusValue] = React.useState<string>(value || '');
  const [focusCellText, setFocusCellText] = React.useState<string>('');
  const [focusCellIndex, setFocusCellIndex] = React.useState<number>(null);

  // ========================= Refs =========================
  const inputRef = React.useRef<HTMLInputElement>();

  const mergedRef = useComposeRef(ref, inputRef);

  // ======================== Format ========================
  const maskFormat = React.useMemo(() => getMask(format || ''), [format]);
  const [selectionStart, selectionEnd] = React.useMemo(
    () => getCellRange(maskFormat, focusCellIndex),
    [maskFormat, focusCellIndex],
  );

  // ====================== Focus Blur ======================
  const onInternalFocus: React.FocusEventHandler<HTMLInputElement> = (event) => {
    onFocus(event);

    setFocused(true);
    setFocusCellIndex(0);
    setFocusCellText('');
  };

  const onInternalBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    onBlur(event);

    // setFocusValue(value || '');

    setFocused(false);
  };

  const onInternalChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    // console.log('>>>', event);
    // setFocusValue(event.target.value);
  };

  const onInternalKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    const { key } = event;

    if (!isNaN(Number(key))) {
      const nextCellText = focusCellText + key;
      setFocusCellText(nextCellText);

      // Replace selection range with `nextCellText`
      const nextFocusValue =
        // before
        focusValue.slice(0, selectionStart) +
        // replace
        leftPad(nextCellText, 4) +
        // after
        focusValue.slice(selectionEnd);
      setFocusValue(nextFocusValue);
      console.log('setted!!!', nextFocusValue);
    }

    onKeyDown?.(event);
  };

  const inputProps: React.InputHTMLAttributes<HTMLInputElement> = format
    ? {
        value: focusValue,
        onFocus: onInternalFocus,
        onBlur: onInternalBlur,
        onChange: onInternalChange,
        onKeyDown: onInternalKeyDown,
      }
    : {};

  // ======================== Format ========================
  const rafRef = React.useRef<number>();

  // useLayoutEffect(() => {
  React.useEffect(() => {
    if (!focused || !format) {
      return;
    }

    console.log('Effect Mask >', maskFormat);

    // Reset with format if not match
    if (!matchFormat(maskFormat, focusValue)) {
      // flushSync(() => {
      setFocusValue(format);
      // });
      return;
    }

    // Match the selection range
    rafRef.current = raf(() => {
      inputRef.current.setSelectionRange(selectionStart, selectionEnd);
    });
    // console.log(
    //   'MMM!',
    //   selectionStart,
    //   selectionEnd,
    //   inputRef.current.value,
    //   inputRef.current.selectionStart,
    //   inputRef.current.selectionEnd,
    // );

    return () => {
      raf.cancel(rafRef.current);
    };
  }, [maskFormat, format, focused, focusValue, focusCellIndex, selectionStart, selectionEnd]);

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

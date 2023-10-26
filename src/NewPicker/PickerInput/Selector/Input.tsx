import classNames from 'classnames';
import { useComposeRef } from 'rc-util';
import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import raf from 'rc-util/lib/raf';
import * as React from 'react';
import { leftPad } from '../../../utils/miscUtil';
import { PrefixClsContext } from '../context';
import Icon from './Icon';
import { getCellRange, getMask, getMaskRange, matchFormat } from './util';

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
  const [forceSelectionSyncMark, forceSelectionSync] = React.useState<object>(null);

  // ========================= Refs =========================
  const inputRef = React.useRef<HTMLInputElement>();

  const mergedRef = useComposeRef(ref, inputRef);

  // ======================== Format ========================
  const [maskFormat, maskCellCount] = React.useMemo(() => getMask(format || ''), [format]);

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
    console.log('key', key);

    // Save the cache with cell text
    let nextCellText: string = null;

    // Fill in the input
    let nextFillText: string = null;

    const maskCellLen = selectionEnd - selectionStart;
    const cellFormat = format.slice(selectionStart, selectionEnd);

    // Cell Index
    const offsetCellIndex = (offset: number) => {
      setFocusCellIndex((idx) => {
        let nextIndex = idx + offset;
        nextIndex = Math.max(nextIndex, 0);
        nextIndex = Math.min(nextIndex, maskCellCount - 1);
        return nextIndex;
      });
    };

    // Range
    const offsetCellValue = (offset: number) => {
      const [rangeStart, rangeEnd, rangeDefault] = getMaskRange(cellFormat);

      const currentText = focusValue.slice(selectionStart, selectionEnd);
      const currentTextNum = Number(currentText);

      if (isNaN(currentTextNum)) {
        return rangeDefault ? rangeDefault : String(offset > 0 ? rangeStart : rangeEnd);
      }

      const num = currentTextNum + offset;
      const range = rangeEnd - rangeStart + 1;
      console.log('>>>>>', num);
      return String(rangeStart + ((range + num - rangeStart) % range));
    };

    switch (key) {
      // =============== Remove ===============
      case 'Backspace':
      case 'Delete':
        nextCellText = '';
        nextFillText = cellFormat;
        break;

      // =============== Arrows ===============
      // Left key
      case 'ArrowLeft':
        nextCellText = '';
        offsetCellIndex(-1);
        break;

      // Right key
      case 'ArrowRight':
        nextCellText = '';
        offsetCellIndex(1);
        break;

      // Up key
      case 'ArrowUp':
        nextCellText = '';
        nextFillText = offsetCellValue(1);
        break;

      // Down key
      case 'ArrowDown':
        nextCellText = '';
        nextFillText = offsetCellValue(-1);
        break;

      // =============== Number ===============
      default:
        if (!isNaN(Number(key))) {
          nextCellText = focusCellText + key;
          nextFillText = nextCellText;
        }
        break;
    }

    // Update cell text
    if (nextCellText !== null) {
      setFocusCellText(nextCellText);

      if (nextCellText.length >= maskCellLen) {
        // Go to next cell
        offsetCellIndex(1);
        setFocusCellText('');
      }
    }

    // Update the input text
    if (nextFillText !== null) {
      // Replace selection range with `nextCellText`
      const nextFocusValue =
        // before
        focusValue.slice(0, selectionStart) +
        // replace
        leftPad(nextFillText, maskCellLen) +
        // after
        focusValue.slice(selectionEnd);
      setFocusValue(nextFocusValue.slice(0, maskFormat.length));
    }

    // Always trigger selection sync after key down
    forceSelectionSync({});

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

  useLayoutEffect(() => {
    if (!focused || !format) {
      return;
    }

    // Reset with format if not match
    if (!matchFormat(maskFormat, focusValue)) {
      setFocusValue(format);
      return;
    }

    // Match the selection range
    inputRef.current.setSelectionRange(selectionStart, selectionEnd);

    // Chrome has the bug anchor position looks not correct but actually correct
    rafRef.current = raf(() => {
      inputRef.current.setSelectionRange(selectionStart, selectionEnd);
    });

    return () => {
      raf.cancel(rafRef.current);
    };
  }, [
    maskFormat,
    format,
    focused,
    focusValue,
    focusCellIndex,
    selectionStart,
    selectionEnd,
    forceSelectionSyncMark,
  ]);

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

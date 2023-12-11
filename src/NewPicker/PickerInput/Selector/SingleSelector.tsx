import classNames from 'classnames';
import pickAttrs from 'rc-util/lib/pickAttrs';
import * as React from 'react';
import type { SelectorProps, SelectorRef } from '../../interface';
import PickerContext from '../context';
import useInputProps from './hooks/useInputProps';
import { ClearIcon } from './Icon';
import Input, { type InputRef } from './Input';

export interface SingleSelectorProps<DateType extends object = any>
  extends SelectorProps<DateType> {
  id?: string;

  value?: DateType[];
  disabled: boolean;

  /** All the field show as `placeholder` */
  allHelp: boolean;

  placeholder?: string;

  // Invalid
  invalid: boolean;
  onInvalid: (valid: boolean) => void;
}

function SingleSelector<DateType extends object = any>(
  props: SingleSelectorProps<DateType>,
  ref: React.Ref<SelectorRef>,
) {
  const {
    id,

    clearIcon,
    suffixIcon,
    activeHelp,
    allHelp,

    focused,
    onFocus,
    onBlur,
    onKeyDown,
    locale,
    generateConfig,

    // Placeholder
    placeholder,

    // Style
    className,
    style,

    // Click
    onClick,
    onClear,

    // Change
    value,
    onChange,
    onSubmit,
    onInputChange,

    // Valid
    format,
    maskFormat,
    changeOnBlur,
    onInvalid,

    // Disabled
    disabled,
    invalid,
    inputReadOnly,

    // Direction
    direction,

    // Open
    onOpenChange,

    // Native
    onMouseDown,

    // Input
    required,
    'aria-required': ariaRequired,

    ...restProps
  } = props;

  const rtl = direction === 'rtl';

  // ======================== Prefix ========================
  const { prefixCls } = React.useContext(PickerContext);

  // ========================= Refs =========================
  const rootRef = React.useRef<HTMLDivElement>();
  const inputRef = React.useRef<InputRef>();

  React.useImperativeHandle(ref, () => ({
    nativeElement: rootRef.current,
    focus: () => {
      inputRef.current?.focus();
    },
    blur: () => {
      inputRef.current?.blur();
    },
  }));

  // ======================== Inputs ========================
  console.log('~~~>', props);
  const getInputProps = useInputProps<DateType>(props, () => {});

  // ======================== Clear =========================
  const showClear = clearIcon && value && !disabled;

  // ======================== Render ========================
  return (
    <div
      {...pickAttrs(restProps, false)}
      className={classNames(
        prefixCls,
        `${prefixCls}-range`,
        {
          [`${prefixCls}-focused`]: focused,
          [`${prefixCls}-invalid`]: invalid,
          [`${prefixCls}-rtl`]: rtl,
        },
        className,
      )}
      style={style}
      ref={rootRef}
      onClick={onClick}
      // Not lose current input focus
      onMouseDown={(e) => {
        const { target } = e;
        if (target !== inputRef.current.inputElement) {
          e.preventDefault();
        }

        onMouseDown?.(e);
      }}
    >
      <Input
        ref={inputRef}
        {...getInputProps()}
        suffixIcon={suffixIcon}
        clearIcon={showClear && <ClearIcon icon={clearIcon} onClear={onClear} />}
      />
    </div>
  );
}

const RefSingleSelector = React.forwardRef(SingleSelector);

if (process.env.NODE_ENV !== 'production') {
  RefSingleSelector.displayName = 'SingleSelector';
}

export default RefSingleSelector;

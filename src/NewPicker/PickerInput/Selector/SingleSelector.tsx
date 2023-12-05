import classNames from 'classnames';
import pickAttrs from 'rc-util/lib/pickAttrs';
import * as React from 'react';
import { formatValue } from '../../../utils/dateUtil';
import type { SelectorProps, SelectorRef } from '../../interface';
import PickerContext from '../context';
import { ClearIcon } from './Icon';
import Input, { type InputProps, type InputRef } from './Input';

export interface SingleSelectorProps<DateType = any> extends SelectorProps<DateType> {
  id?: string;

  value?: DateType;
  disabled: boolean;

  /** All the field show as `placeholder` */
  allHelp: boolean;

  placeholder?: string;

  // Invalid
  invalid: boolean;
  onInvalid: (valid: boolean) => void;
}

function SingleSelector<DateType = any>(
  props: SingleSelectorProps<DateType>,
  ref: React.Ref<SelectorRef>,
) {
  const {
    id,

    clearIcon,
    suffixIcon,
    activeIndex,
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
    open,
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

  // ======================== Parser ========================
  const parseDate = (str: string, formatStr: string) => {
    const parsed = generateConfig.locale.parse(locale.locale, str, [formatStr]);
    return parsed && generateConfig.isValidate(parsed) ? parsed : null;
  };

  // ========================= Text =========================
  const firstFormat = format[0];

  const getText = React.useCallback(
    (date: DateType) =>
      formatValue(date, {
        locale,
        format: firstFormat,
        generateConfig,
      }),
    [locale, generateConfig, firstFormat],
  );

  const valueTexts = React.useMemo(() => [getText(value[0]), getText(value[1])], [value, getText]);

  // ======================= Validate =======================
  const validateFormat = (text: string) => {
    for (let i = 0; i < format.length; i += 1) {
      const singleFormat = format[i];

      // Only support string type
      if (typeof singleFormat === 'string') {
        const parsed = parseDate(text, singleFormat);

        if (parsed) {
          return parsed;
        }
      }
    }

    return false;
  };

  // ======================== Inputs ========================
  const getInputProps = (index: number): InputProps => ({
    // ============== Shared ==============
    format: maskFormat,
    validateFormat: (text) => !!validateFormat(text),
    changeOnBlur,

    readOnly: inputReadOnly,

    required,
    'aria-required': ariaRequired,

    // ============= By Index =============
    id: ids[index],

    value: valueTexts[index],

    invalid: invalid[index],

    placeholder: (placeholder || [])[index],

    active: activeIndex === index,

    helped: allHelp || (activeHelp && activeIndex === index),

    disabled: disabled[index],

    onFocus: (event) => {
      onFocus(event, index);
    },
    onBlur: (event) => {
      // Blur do not trigger close
      // Since it may focus to the popup panel
      onBlur(event, index);
    },

    onSubmit,

    // Get validate text value
    onChange: (text) => {
      onInputChange();

      const parsed = validateFormat(text);

      if (parsed) {
        onInvalid(index, false);
        onChange(parsed, index);
        return;
      }

      // Tell outer that the value typed is invalid.
      // If text is empty, it means valid.
      onInvalid(index, !!text);
    },
    onHelp: () => {
      onOpenChange(true);
    },
    onKeyDown: (event) => {
      switch (event.key) {
        case 'Escape':
          onOpenChange(false);
          break;
      }

      onKeyDown?.(event);
    },
  });

  // ======================== Clear =========================
  const showClear = (clearIcon && value[0] && !disabled[0]) || (value[1] && !disabled[1]);

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
        suffixIcon={suffixIcon}
        clearIcon={showClear && <ClearIcon icon={clearIcon} onClear={onClear} />}
      />

      {/* <Input ref={inputStartRef} {...getInputProps(0)} date-range="start" />
      <Input ref={inputEndRef} {...getInputProps(1)} date-range="end" />
      <div className={`${prefixCls}-active-bar`} style={activeBarStyle} />
      <Icon type="suffix" icon={suffixIcon} />
      */}
    </div>
  );
}

const RefSingleSelector = React.forwardRef(SingleSelector);

if (process.env.NODE_ENV !== 'production') {
  RefSingleSelector.displayName = 'SingleSelector';
}

export default RefSingleSelector;

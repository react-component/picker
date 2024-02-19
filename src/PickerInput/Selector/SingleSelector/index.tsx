import classNames from 'classnames';
import * as React from 'react';
import type { InternalMode, SelectorProps, SelectorRef } from '../../../interface';
import { isSame } from '../../../utils/dateUtil';
import PickerContext from '../../context';
import type { PickerProps } from '../../SinglePicker';
import useInputProps from '../hooks/useInputProps';
import useRootProps from '../hooks/useRootProps';
import Icon, { ClearIcon } from '../Icon';
import Input, { type InputRef } from '../Input';
import MultipleDates from './MultipleDates';

export interface SingleSelectorProps<DateType extends object = any>
  extends SelectorProps<DateType>,
    Pick<PickerProps, 'multiple' | 'maxTagCount'> {
  id?: string;

  value?: DateType[];
  onChange: (date: DateType[]) => void;

  internalPicker: InternalMode;

  disabled: boolean;

  /** All the field show as `placeholder` */
  allHelp: boolean;

  placeholder?: string;

  // Invalid
  invalid: boolean;
  onInvalid: (valid: boolean) => void;

  removeIcon?: React.ReactNode;
}

function SingleSelector<DateType extends object = any>(
  props: SingleSelectorProps<DateType>,
  ref: React.Ref<SelectorRef>,
) {
  const {
    id,

    open,

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
    internalPicker,
    value,
    onChange,
    onSubmit,
    onInputChange,
    multiple,
    maxTagCount,

    // Valid
    format,
    maskFormat,
    preserveInvalidOnBlur,
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
    autoFocus,

    removeIcon,

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

  // ======================== Props =========================
  const rootProps = useRootProps(restProps);

  // ======================== Change ========================
  const onSingleChange = (date: DateType) => {
    onChange([date]);
  };

  const onMultipleRemove = (date: DateType) => {
    const nextValues = value.filter(
      (oriDate) => oriDate && !isSame(generateConfig, locale, oriDate, date, internalPicker),
    );
    onChange(nextValues);

    // When `open`, it means user is operating the
    if (!open) {
      onSubmit();
    }
  };

  // ======================== Inputs ========================
  const [getInputProps, getText] = useInputProps<DateType>(
    {
      ...props,
      onChange: onSingleChange,
    },
    ({ valueTexts }) => ({
      value: valueTexts[0] || '',
      active: focused,
    }),
  );

  // ======================== Clear =========================
  const showClear = !!(clearIcon && value.length && !disabled);

  // ======================= Multiple =======================
  const selectorNode = multiple ? (
    <>
      <MultipleDates
        prefixCls={prefixCls}
        value={value}
        onRemove={onMultipleRemove}
        formatDate={getText}
        maxTagCount={maxTagCount}
        disabled={disabled}
        removeIcon={removeIcon}
      />
      <input
        className={`${prefixCls}-multiple-input`}
        value={value.map(getText).join(',')}
        ref={inputRef as any}
        readOnly
        autoFocus={autoFocus}
      />
      <Icon type="suffix" icon={suffixIcon} />
      {showClear && <ClearIcon icon={clearIcon} onClear={onClear} />}
    </>
  ) : (
    <Input
      ref={inputRef}
      {...getInputProps()}
      autoFocus={autoFocus}
      suffixIcon={suffixIcon}
      clearIcon={showClear && <ClearIcon icon={clearIcon} onClear={onClear} />}
      showActiveCls={false}
    />
  );

  // ======================== Render ========================
  return (
    <div
      {...rootProps}
      className={classNames(
        prefixCls,
        {
          [`${prefixCls}-multiple`]: multiple,
          [`${prefixCls}-focused`]: focused,
          [`${prefixCls}-disabled`]: disabled,
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
        if (target !== inputRef.current?.inputElement) {
          e.preventDefault();
        }

        onMouseDown?.(e);
      }}
    >
      {selectorNode}
    </div>
  );
}

const RefSingleSelector = React.forwardRef(SingleSelector);

if (process.env.NODE_ENV !== 'production') {
  RefSingleSelector.displayName = 'SingleSelector';
}

export default RefSingleSelector;

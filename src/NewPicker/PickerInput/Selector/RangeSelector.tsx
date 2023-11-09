import classNames from 'classnames';
import * as React from 'react';
import type { OpenConfig, SelectorProps, SelectorRef } from '../../interface';
import PickerContext from '../context';
import Icon, { ClearIcon } from './Icon';
import Input, { type InputProps, type InputRef } from './Input';

export interface RangeSelectorProps<DateType = any> extends SelectorProps<DateType> {
  separator?: React.ReactNode;

  value?: [DateType?, DateType?];
  disabled: [boolean, boolean];

  allHelp: boolean;

  placeholder?: [string, string];

  invalid: [boolean, boolean];
  onInvalid: (index: number, valid: boolean) => void;
}

function RangeSelector<DateType = any>(
  props: RangeSelectorProps<DateType>,
  ref: React.Ref<SelectorRef>,
) {
  const {
    clearIcon,
    suffixIcon,
    separator = '~',
    activeIndex,
    activeHelp,
    allHelp,

    onFocus,
    onBlur,
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
    open,
    onOpenChange,
  } = props;

  // ======================== Prefix ========================
  const { prefixCls } = React.useContext(PickerContext);

  // ========================= Refs =========================
  const rootRef = React.useRef<HTMLDivElement>();
  const inputStartRef = React.useRef<InputRef>();
  const inputEndRef = React.useRef<InputRef>();

  const getInput = (index: number) => [inputStartRef, inputEndRef][index]?.current;

  React.useImperativeHandle(ref, () => ({
    nativeElement: rootRef.current,
    focus: (index = 0) => {
      getInput(index)?.focus();
    },
    blur: () => {
      getInput(0)?.blur();
      getInput(1)?.blur();
    },
  }));

  // ========================= Open =========================
  const triggerOpen = (nextOpen: boolean, index: number, config: OpenConfig = {}) => {
    onOpenChange(nextOpen, {
      ...config,
      index,
    });
  };

  // ======================== Parser ========================
  const parseDate = (str: string, formatStr: string) => {
    const parsed = generateConfig.locale.parse(locale.locale, str, [formatStr]);
    return parsed && generateConfig.isValidate(parsed) ? parsed : null;
  };

  // ========================= Text =========================
  const firstFormat = format[0];

  const getText = React.useCallback(
    (date: any) => (date ? generateConfig.locale.format(locale.locale, date, firstFormat) : ''),
    [locale, generateConfig, firstFormat],
  );

  const valueTexts = React.useMemo(() => [getText(value[0]), getText(value[1])], [value, getText]);

  // ======================== Inputs ========================
  const getInputProps = (index: number): InputProps => ({
    // ============== Shared ==============
    format: maskFormat,
    validateFormat: (str: string, formatStr: string) => {
      const parsed = parseDate(str, formatStr);
      return !!parsed;
    },
    preserveInvalidOnBlur,

    readOnly: inputReadOnly,

    // ============= By Index =============
    value: valueTexts[index],

    invalid: invalid[index],

    placeholder: (placeholder || [])[index],

    active: activeIndex === index,

    helped: allHelp || (activeHelp && activeIndex === index),

    disabled: disabled[index],

    onFocus: (event) => {
      onFocus(event, index);

      triggerOpen(true, index, {
        inherit: true,
      });
    },
    onBlur: (event) => {
      // Blur do not trigger close
      // Since it may focus to the popup panel
      onBlur(event, index);
      triggerOpen(false, index);
    },

    onEnter: onSubmit,

    // Get validate text value
    onChange: (text) => {
      for (let i = 0; i < format.length; i += 1) {
        const parsed = parseDate(text, format[i]);

        if (parsed) {
          onInvalid(index, false);
          onChange(parsed, index);
          return;
        }
      }

      // Tell outer that the value typed is invalid.
      // If text is empty, it means valid.
      onInvalid(index, !!text);
    },
    onHelp: () => {
      triggerOpen(true, index);
    },
    onKeyDown: (event) => {
      switch (event.key) {
        case 'Escape':
          triggerOpen(false, index);
          break;
      }
    },
  });

  // ====================== ActiveBar =======================
  const [activeBarStyle, setActiveBarStyle] = React.useState<React.CSSProperties>({
    position: 'absolute',
    width: 0,
    left: 0,
  });

  React.useEffect(() => {
    const input = getInput(activeIndex);
    if (input) {
      setActiveBarStyle((ori) => ({
        ...ori,
        width: input.nativeElement.offsetWidth,
        left: input.nativeElement.offsetLeft,
      }));
    }
  }, [activeIndex]);

  // ======================== Clear =========================
  const showClear = (clearIcon && value[0] && !disabled[0]) || (value[1] && !disabled[1]);

  // ======================== Render ========================
  return (
    <div
      className={classNames(
        prefixCls,
        `${prefixCls}-range`,
        {
          [`${prefixCls}-focused`]: activeIndex !== null,
          [`${prefixCls}-invalid`]: invalid.some((i) => i),
          [`${prefixCls}-rtl`]: direction === 'rtl',
        },
        className,
      )}
      style={style}
      ref={rootRef}
      onClick={onClick}
    >
      <Input ref={inputStartRef} {...getInputProps(0)} />
      <div className={`${prefixCls}-range-separator`}>{separator}</div>
      <Input ref={inputEndRef} {...getInputProps(1)} />
      <div className={`${prefixCls}-active-bar`} style={activeBarStyle} />
      <Icon type="suffix" icon={suffixIcon} />
      {showClear && <ClearIcon type="clear" icon={clearIcon} onClear={onClear} />}
    </div>
  );
}

const RefRangeSelector = React.forwardRef(RangeSelector);

if (process.env.NODE_ENV !== 'production') {
  RefRangeSelector.displayName = 'RangeSelector';
}

export default RefRangeSelector;

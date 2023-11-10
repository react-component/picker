import classNames from 'classnames';
import * as React from 'react';
import { formatValue } from '../../../utils/dateUtil';
import type { OpenConfig, SelectorProps, SelectorRef } from '../../interface';
import PickerContext from '../context';
import Icon, { ClearIcon } from './Icon';
import Input, { type InputProps, type InputRef } from './Input';

export type SelectorIdType =
  | string
  | {
      start?: string;
      end?: string;
    };

export interface RangeSelectorProps<DateType = any> extends SelectorProps<DateType> {
  id?: SelectorIdType;

  separator?: React.ReactNode;

  value?: [DateType?, DateType?];
  disabled: [boolean, boolean];

  allHelp: boolean;

  placeholder?: [string, string];

  // Invalid
  invalid: [boolean, boolean];
  onInvalid: (index: number, valid: boolean) => void;

  // Offset
  /**
   * Trigger when the active bar offset position changed.
   * This is used for popup panel offset.
   */
  onActiveOffset: (offset: number) => void;
}

function RangeSelector<DateType = any>(
  props: RangeSelectorProps<DateType>,
  ref: React.Ref<SelectorRef>,
) {
  const {
    id,

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
    onInputChange,

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

    // Offset
    onActiveOffset,
  } = props;

  const rtl = direction === 'rtl';

  // ======================== Prefix ========================
  const { prefixCls } = React.useContext(PickerContext);

  // ========================== Id ==========================
  const ids = React.useMemo(() => {
    if (typeof id === 'string') {
      return [id];
    }

    const mergedId = id || {};

    return [mergedId.start, mergedId.end];
  }, [id]);

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
    (date: DateType) =>
      formatValue(date, {
        locale,
        format: firstFormat,
        generateConfig,
      }),
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
    id: ids[index],

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
      onInputChange();

      for (let i = 0; i < format.length; i += 1) {
        const singleFormat = format[i];

        // Only support string type
        if (typeof singleFormat === 'string') {
          const parsed = parseDate(text, singleFormat);

          if (parsed) {
            onInvalid(index, false);
            onChange(parsed, index);
            return;
          }
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
  const offsetUnit = rtl ? 'right' : 'left';

  const [activeBarStyle, setActiveBarStyle] = React.useState<React.CSSProperties>({
    position: 'absolute',
    width: 0,
    [offsetUnit]: 0,
  });

  React.useEffect(() => {
    const input = getInput(activeIndex);
    if (input) {
      const { offsetWidth, offsetLeft, offsetParent } = input.nativeElement;

      let offset = offsetLeft;
      if (rtl) {
        const parentElement = offsetParent as HTMLElement;
        const parentStyle = getComputedStyle(parentElement);

        offset =
          parentElement.offsetWidth -
          parseFloat(parentStyle.borderRightWidth) -
          parseFloat(parentStyle.borderLeftWidth) -
          offsetLeft -
          offsetWidth;
      }

      setActiveBarStyle((ori) => ({
        ...ori,
        width: offsetWidth,
        [offsetUnit]: offset,
      }));

      onActiveOffset(offset);
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
        if (
          target !== inputStartRef.current.inputElement &&
          target !== inputEndRef.current.inputElement
        ) {
          e.preventDefault();
        }
      }}
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

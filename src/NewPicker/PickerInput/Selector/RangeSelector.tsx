import classNames from 'classnames';
import ResizeObserver from 'rc-resize-observer';
import { useEvent } from 'rc-util';
import pickAttrs from 'rc-util/lib/pickAttrs';
import * as React from 'react';
import type { SelectorProps, SelectorRef } from '../../interface';
import PickerContext from '../context';
import useInputProps from './hooks/useInputProps';
import Icon, { ClearIcon } from './Icon';
import Input, { type InputRef } from './Input';

export type SelectorIdType =
  | string
  | {
      start?: string;
      end?: string;
    };

export interface RangeSelectorProps<DateType = any> extends SelectorProps<DateType> {
  id?: SelectorIdType;

  activeIndex: number | null;

  separator?: React.ReactNode;

  value?: [DateType?, DateType?];
  disabled: [boolean, boolean];

  /** All the field show as `placeholder` */
  allHelp: boolean;

  placeholder?: string | [string, string];

  // Invalid
  invalid: [boolean, boolean];

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

    // Offset
    onActiveOffset,

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

  // ===================== Placeholder ======================
  const mergedPlaceholder = React.useMemo<[string, string]>(
    () => (Array.isArray(placeholder) ? placeholder : [placeholder, placeholder]),
    [placeholder],
  );

  // ======================== Inputs ========================
  const getInputProps = useInputProps({
    ...props,
    id: ids,
    placeholder: mergedPlaceholder,
  });

  // ====================== ActiveBar =======================
  const offsetUnit = rtl ? 'right' : 'left';

  const [activeBarStyle, setActiveBarStyle] = React.useState<React.CSSProperties>({
    position: 'absolute',
    width: 0,
    [offsetUnit]: 0,
  });

  const syncActiveOffset = useEvent(() => {
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
  });

  React.useEffect(() => {
    syncActiveOffset();
  }, [activeIndex]);

  // ======================== Clear =========================
  const showClear = (clearIcon && value[0] && !disabled[0]) || (value[1] && !disabled[1]);

  // ======================== Render ========================
  return (
    <ResizeObserver onResize={syncActiveOffset}>
      <div
        {...pickAttrs(restProps, false)}
        className={classNames(
          prefixCls,
          `${prefixCls}-range`,
          {
            [`${prefixCls}-focused`]: focused,
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

          onMouseDown?.(e);
        }}
      >
        <Input ref={inputStartRef} {...getInputProps(0)} date-range="start" />
        <div className={`${prefixCls}-range-separator`}>{separator}</div>
        <Input ref={inputEndRef} {...getInputProps(1)} date-range="end" />
        <div className={`${prefixCls}-active-bar`} style={activeBarStyle} />
        <Icon type="suffix" icon={suffixIcon} />
        {showClear && <ClearIcon icon={clearIcon} onClear={onClear} />}
      </div>
    </ResizeObserver>
  );
}

const RefRangeSelector = React.forwardRef(RangeSelector);

if (process.env.NODE_ENV !== 'production') {
  RefRangeSelector.displayName = 'RangeSelector';
}

export default RefRangeSelector;

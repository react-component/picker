import { useMergedState } from 'rc-util';
import * as React from 'react';
import type { PickerRef, SelectorRef, SharedPickerProps } from '../interface';
import PickerPanel from '../PickerPanel';
import PickerTrigger from '../PickerTrigger';
import PickerContext from './context';
import SingleSelector from './Selector/SingleSelector';

export type SinglePickerProps = SharedPickerProps;

const SinglePicker = React.forwardRef<PickerRef, SinglePickerProps>((props, ref) => {
  const {
    prefixCls = 'rc-picker',

    // MISC
    direction,

    // Selector
    className,
    style,
    classNames = {},
    styles = {},

    // Icons
    suffixIcon,

    // Focus
    onFocus,
    onBlur,

    // Open
    defaultOpen,
    open,
    onOpenChange,
    popupAlign,
    getPopupContainer,

    // Motion
    transitionName,
  } = props;

  // ============================= Open =============================
  const [mergedOpen, setMergeOpen] = useMergedState(defaultOpen || false, {
    value: open,
    onChange: onOpenChange,
  });

  const popupPlacement = direction === 'rtl' ? 'bottomRight' : 'bottomLeft';

  // ============================ Active ============================
  const [focused, setFocused] = React.useState(false);

  const onInternalFocus: React.FocusEventHandler<HTMLInputElement> = (event) => {
    onFocus?.(event);
    setFocused(true);
    setMergeOpen(true);
  };

  const onInternalBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    onBlur?.(event);
    setFocused(false);
    setMergeOpen(false);
  };

  // ============================= Refs =============================
  const selectorRef = React.useRef<SelectorRef>();

  React.useImperativeHandle(ref, () => ({
    nativeElement: selectorRef.current?.nativeElement,
    focus: selectorRef.current?.focus,
    blur: selectorRef.current?.blur,
  }));

  // ============================ Panels ============================
  const panel = <PickerPanel />;

  // ============================ Render ============================
  return (
    <PickerContext.Provider value={{ prefixCls }}>
      <PickerTrigger
        visible={mergedOpen}
        popupElement={panel}
        popupStyle={styles.popup}
        popupClassName={classNames.popup}
        popupAlign={popupAlign}
        getPopupContainer={getPopupContainer}
        transitionName={transitionName}
        popupPlacement={popupPlacement}
        direction={direction}
      >
        <SingleSelector
          ref={selectorRef}
          className={className}
          style={style}
          suffixIcon={suffixIcon}
          // Focus
          focused={focused}
          onFocus={onInternalFocus}
          onBlur={onInternalBlur}
        />
      </PickerTrigger>
    </PickerContext.Provider>
  );
});

if (process.env.NODE_ENV !== 'production') {
  SinglePicker.displayName = 'SinglePicker';
}

export default SinglePicker;

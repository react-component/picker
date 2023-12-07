import { useEvent, useMergedState } from 'rc-util';
import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import omit from 'rc-util/lib/omit';
import pickAttrs from 'rc-util/lib/pickAttrs';
import warning from 'rc-util/lib/warning';
import * as React from 'react';
import type {
  BaseInfo,
  InternalMode,
  OnOpenChange,
  OpenConfig,
  PanelMode,
  PickerRef,
  RangeTimeProps,
  SelectorProps,
  SharedHTMLAttrs,
  SharedPickerProps,
  ValueDate,
} from '../interface';
import type { PickerPanelProps } from '../PickerPanel';
import PickerTrigger from '../PickerTrigger';
import { fillIndex } from '../util';
import PickerContext from './context';
import useCellRender from './hooks/useCellRender';
import useFieldsInvalidate from './hooks/useFieldsInvalidate';
import useFilledProps from './hooks/useFilledProps';
import useOpen from './hooks/useOpen';
import { usePickerRef } from './hooks/usePickerRef';
import usePresets from './hooks/usePresets';
import useRangeActive from './hooks/useRangeActive';
import useRangeDisabledDate from './hooks/useRangeDisabledDate';
import useRangePickerValue from './hooks/useRangePickerValue';
import useRangeValue, { useInnerValue } from './hooks/useRangeValue';
import useShowNow from './hooks/useShowNow';
import Popup from './Popup';
import RangeSelector, { type SelectorIdType } from './Selector/RangeSelector';

function separateConfig<T>(config: T | [T, T] | null | undefined, defaultConfig: T): [T, T] {
  const singleConfig = config ?? defaultConfig;

  if (Array.isArray(singleConfig)) {
    return singleConfig;
  }

  return [singleConfig, singleConfig];
}

export type RangeValueType<DateType> = [start?: DateType, end?: DateType];

export interface RangePickerProps<DateType extends object>
  extends Omit<SharedPickerProps<DateType>, 'showTime' | 'id'> {
  // Structure
  id?: SelectorIdType;

  // Value
  value?: RangeValueType<DateType>;
  defaultValue?: RangeValueType<DateType>;
  onChange?: (dates: RangeValueType<DateType>, dateStrings: [string, string]) => void;
  onCalendarChange?: (
    dates: RangeValueType<DateType>,
    dateStrings: [string, string],
    info: BaseInfo,
  ) => void;

  // Placeholder
  placeholder?: [string, string];

  // Picker Value
  /**
   * Config the popup panel date.
   * Every time active the input to open popup will reset with `defaultPickerValue`.
   *
   * Note: `defaultPickerValue` priority is higher than `value` for the first open.
   */
  defaultPickerValue?: [DateType, DateType] | null;
  /**
   * Config each start & end field popup panel date.
   * When config `pickerValue`, you must also provide `onPickerValueChange` to handle changes.
   */
  pickerValue?: [DateType, DateType] | null;
  /**
   * Each popup panel `pickerValue` change will trigger the callback.
   * @param date The changed picker value
   * @param info.source `panel` from the panel click. `reset` from popup open or field typing.
   */
  onPickerValueChange?: (
    date: [DateType, DateType],
    info: BaseInfo & {
      source: 'reset' | 'panel';
    },
  ) => void;

  // range
  /** Default will always order of selection after submit */
  order?: boolean;

  // Preset
  presets?: ValueDate<Exclude<RangeValueType<DateType>, null>>[];
  /** @deprecated Please use `presets` instead */
  ranges?: Record<
    string,
    Exclude<RangeValueType<DateType>, null> | (() => Exclude<RangeValueType<DateType>, null>)
  >;

  // Control
  disabled?: boolean | [boolean, boolean];
  allowEmpty?: boolean | [boolean, boolean];

  // Time
  showTime?: boolean | RangeTimeProps<DateType>;

  // Mode
  mode?: [startMode: PanelMode, endMode: PanelMode];
  onPanelChange?: (
    values: RangeValueType<DateType>,
    modes: [startMode: PanelMode, endMode: PanelMode],
  ) => void;
}

function getActiveRange(activeIndex: number) {
  return activeIndex === 1 ? 'end' : 'start';
}

function RangePicker<DateType extends object = any>(
  props: RangePickerProps<DateType>,
  ref: React.Ref<PickerRef>,
) {
  // ========================= Prop =========================
  const [filledProps, internalPicker, complexPicker, formatList, maskFormat, isInvalidateDate] =
    useFilledProps(props, () => {
      const { disabled, allowEmpty } = props;

      const mergedDisabled = separateConfig(disabled, false);
      const mergedAllowEmpty = separateConfig(allowEmpty, false);

      return {
        disabled: mergedDisabled,
        allowEmpty: mergedAllowEmpty,
      };
    });

  const {
    // Style
    prefixCls,
    styles,
    classNames,

    // Value
    defaultValue,
    value,
    needConfirm,

    // Disabled
    disabled,
    allowEmpty,
    disabledDate,
    minDate,
    maxDate,

    // Open
    defaultOpen,
    open,
    onOpenChange,
    popupAlign,
    getPopupContainer,

    // Picker
    locale,
    generateConfig,
    picker,
    showNow,
    showToday,
    showTime,

    // Mode
    mode,
    onPanelChange,
    onCalendarChange,

    // Picker Value
    defaultPickerValue,
    pickerValue,
    onPickerValueChange,

    // Format
    inputReadOnly,

    // Motion
    transitionName,

    suffixIcon,
    direction,

    // Focus
    onFocus,
    onBlur,

    // Presets
    presets,
    ranges,

    // Render
    components,
    cellRender,
    dateRender,
    monthCellRender,

    // Native
    onClick,
  } = filledProps;

  // ========================= Refs =========================
  const selectorRef = usePickerRef(ref);

  // ========================= Open =========================
  const popupPlacement = direction === 'rtl' ? 'bottomRight' : 'bottomLeft';

  const [mergedOpen, setMergeOpen] = useOpen(open, defaultOpen, onOpenChange);

  const triggerOpen: OnOpenChange = (nextOpen, config?: OpenConfig) => {
    // No need to open if all disabled
    if (disabled.some((fieldDisabled) => !fieldDisabled) || !nextOpen) {
      setMergeOpen(nextOpen, config);
    }
  };

  // ======================== Values ========================
  const [mergedValue, setInnerValue, getCalendarValue, triggerCalendarChange] = useInnerValue(
    generateConfig,
    locale,
    formatList,
    defaultValue,
    value,
    onCalendarChange,
    2,
  );

  const calendarValue = getCalendarValue();

  // ======================== Active ========================
  const [
    focused,
    triggerFocus,
    lastOperation,
    activeIndex,
    setActiveIndex,
    nextActiveIndex,
    activeIndexList,
  ] = useRangeActive(disabled, allowEmpty);

  const onSharedFocus = (event: React.FocusEvent<HTMLElement>, index?: number) => {
    triggerFocus(true);

    onFocus?.(event, {
      range: getActiveRange(index ?? activeIndex),
    });
  };

  const onSharedBlur = (event: React.FocusEvent<HTMLElement>, index?: number) => {
    triggerFocus(false);

    onBlur?.(event, {
      range: getActiveRange(index ?? activeIndex),
    });
  };

  // ========================= Mode =========================
  const [modes, setModes] = useMergedState<[PanelMode, PanelMode]>([picker, picker], {
    value: mode,
  });

  const mergedMode = modes[activeIndex] || picker;

  /** Extends from `mergedMode` to patch `datetime` mode */
  const internalMode: InternalMode = mergedMode === 'date' && showTime ? 'datetime' : mergedMode;

  // ====================== PanelCount ======================
  const multiplePanel = internalMode === picker && internalMode !== 'time';

  // ======================= Show Now =======================
  const mergedShowNow = useShowNow(internalPicker, mergedMode, showNow, showToday);

  // ======================== Value =========================
  const [
    /** Trigger `onChange` by check `disabledDate` */
    flushSubmit,
    /** Trigger `onChange` directly without check `disabledDate` */
    triggerSubmitChange,
  ] = useRangeValue<RangeValueType<DateType>, DateType>(
    filledProps,
    mergedValue,
    setInnerValue,
    getCalendarValue,
    triggerCalendarChange,
    disabled,
    formatList,
    focused,
    mergedOpen,
    isInvalidateDate,
  );

  // ===================== DisabledDate =====================
  const mergedDisabledDate = useRangeDisabledDate(
    calendarValue,
    disabled,
    activeIndexList,
    generateConfig,
    locale,
    disabledDate,
  );

  // ======================= Validate =======================
  const [submitInvalidates, onSelectorInvalid] = useFieldsInvalidate(
    calendarValue,
    isInvalidateDate,
    allowEmpty,
  );

  // ===================== Picker Value =====================
  const [currentPickerValue, setCurrentPickerValue] = useRangePickerValue(
    generateConfig,
    locale,
    calendarValue,
    mergedOpen,
    activeIndex,
    internalPicker,
    multiplePanel,
    defaultPickerValue,
    pickerValue,
    showTime?.defaultValue,
    onPickerValueChange,
    minDate,
    maxDate,
  );

  // >>> Mode need wait for `pickerValue`
  const triggerModeChange = useEvent(
    (nextPickerValue: DateType, nextMode: PanelMode, triggerEvent?: boolean) => {
      const clone = fillIndex(modes, activeIndex, nextMode);

      if (clone[0] !== modes[0] || clone[1] !== modes[1]) {
        setModes(clone);
      }

      // Compatible with `onPanelChange`
      if (onPanelChange && triggerEvent !== false) {
        const clonePickerValue: RangeValueType<DateType> = [...calendarValue];
        if (nextPickerValue) {
          clonePickerValue[activeIndex] = nextPickerValue;
        }
        onPanelChange(clonePickerValue, clone);
      }
    },
  );

  // ======================== Change ========================
  const fillCalendarValue = (date: DateType, index: number) =>
    // Trigger change only when date changed
    fillIndex(calendarValue, index, date);

  // ======================== Submit ========================
  /**
   * Trigger by confirm operation.
   * This function has already handle the `needConfirm` check logic.
   * - Selector: enter key
   * - Panel: OK button
   */
  const triggerPartConfirm = (date?: DateType, skipFocus?: boolean) => {
    let nextValue = calendarValue;

    if (date) {
      nextValue = fillCalendarValue(date, activeIndex);
    }

    // Get next focus index
    const nextIndex = nextActiveIndex(nextValue);

    // Change calendar value and tell flush it
    triggerCalendarChange(nextValue);
    flushSubmit(activeIndex, nextIndex === null);

    if (nextIndex === null) {
      triggerOpen(false, { force: true });
    } else if (!skipFocus) {
      selectorRef.current.focus(nextIndex);
    }
  };

  // ======================== Click =========================
  const onSelectorClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (!selectorRef.current.nativeElement.contains(document.activeElement)) {
      // Click to focus the enabled input
      const enabledIndex = disabled.findIndex((d) => !d);
      if (enabledIndex >= 0) {
        selectorRef.current.focus(enabledIndex);
      }
    }

    triggerOpen(true);

    onClick?.(event);
  };

  const onSelectorClear = () => {
    triggerSubmitChange(null);
    triggerOpen(false, { force: true });
  };

  // ======================== Hover =========================
  const [hoverSource, setHoverSource] = React.useState<'cell' | 'preset'>(null);
  const [internalHoverValues, setInternalHoverValues] =
    React.useState<RangeValueType<DateType>>(null);

  const hoverValues = React.useMemo(() => {
    return internalHoverValues || calendarValue;
  }, [calendarValue, internalHoverValues]);

  // Clean up `internalHoverValues` when closed
  React.useEffect(() => {
    if (!mergedOpen) {
      setInternalHoverValues(null);
    }
  }, [mergedOpen]);

  // ========================================================
  // ==                       Panels                       ==
  // ========================================================
  const [activeOffset, setActiveOffset] = React.useState(0);

  // ======================= Presets ========================
  const presetList = usePresets(presets, ranges);

  const onPresetHover = (nextValues: RangeValueType<DateType> | null) => {
    setInternalHoverValues(nextValues);
    setHoverSource('preset');
  };

  const onPresetSubmit = (nextValues: RangeValueType<DateType>) => {
    const passed = triggerSubmitChange(nextValues);

    if (passed) {
      triggerOpen(false, { force: true });
    }
  };

  // ======================== Panel =========================
  const onPanelHover = (date: DateType) => {
    setInternalHoverValues(date ? fillCalendarValue(date, activeIndex) : null);
    setHoverSource('cell');
  };

  // >>> Focus
  const onPanelFocus: React.FocusEventHandler<HTMLElement> = (event) => {
    triggerOpen(true);
    onSharedFocus(event);
  };

  // >>> Calendar
  const onPanelCalendarChange: PickerPanelProps<DateType>['onChange'] = (date) => {
    lastOperation('panel');

    const clone: RangeValueType<DateType> = fillIndex(calendarValue, activeIndex, date);

    // Only trigger calendar event but not update internal `calendarValue` state
    triggerCalendarChange(clone);

    // >>> Trigger next active if !needConfirm
    // Fully logic check `useRangeValue` hook
    if (!needConfirm && !complexPicker && internalPicker === internalMode) {
      triggerPartConfirm(date);
    }
  };

  // >>> Close
  const onPopupClose = () => {
    // Close popup
    triggerOpen(false);
  };

  // >>> cellRender
  const onInternalCellRender = useCellRender(
    cellRender,
    dateRender,
    monthCellRender,
    getActiveRange(activeIndex),
  );

  // >>> Value
  const panelValue = calendarValue[activeIndex] || null;

  // >>> invalid

  const panelProps = React.useMemo(() => {
    const domProps = pickAttrs(filledProps, false);
    const restProps = omit(filledProps, [
      ...(Object.keys(domProps) as (keyof SharedHTMLAttrs)[]),
      'onChange',
      'onCalendarChange',
      'style',
      'className',
      'id',
      'onPanelChange',
    ]);
    return restProps;
  }, [filledProps]);

  // >>> Render
  const panel = (
    <Popup<any>
      // MISC
      {...panelProps}
      showNow={mergedShowNow}
      showTime={showTime}
      // Range
      range
      multiple={multiplePanel}
      activeOffset={activeOffset}
      // Disabled
      disabledDate={mergedDisabledDate}
      // Focus
      onFocus={onPanelFocus}
      onBlur={onSharedBlur}
      // Mode
      picker={picker}
      mode={mergedMode}
      internalMode={internalMode}
      onPanelChange={triggerModeChange}
      // Value
      value={panelValue}
      isInvalid={isInvalidateDate}
      onChange={null}
      onCalendarChange={onPanelCalendarChange}
      // PickerValue
      pickerValue={currentPickerValue}
      onPickerValueChange={setCurrentPickerValue}
      // Hover
      hoverValue={hoverValues}
      onHover={onPanelHover}
      // Submit
      needConfirm={needConfirm}
      onSubmit={triggerPartConfirm}
      // Preset
      presets={presetList}
      onPresetHover={onPresetHover}
      onPresetSubmit={onPresetSubmit}
      // Render
      cellRender={onInternalCellRender}
    />
  );

  // ========================================================
  // ==                      Selector                      ==
  // ========================================================

  // ======================== Change ========================
  const onSelectorChange = (date: DateType, index: number) => {
    const clone = fillCalendarValue(date, index);

    triggerCalendarChange(clone);
  };

  const onSelectorInputChange = () => {
    lastOperation('input');
  };

  // ======================= Selector =======================
  const onSelectorFocus: SelectorProps['onFocus'] = (event, index) => {
    lastOperation('input');

    triggerOpen(true, {
      inherit: true,
    });

    setActiveIndex(index);

    onSharedFocus(event, index);
  };

  const onSelectorBlur: SelectorProps['onBlur'] = (event, index) => {
    triggerOpen(false);

    onSharedBlur(event, index);
  };

  const onSelectorKeyDown: SelectorProps['onKeyDown'] = (event) => {
    if (event.key === 'Tab') {
      triggerPartConfirm(null, true);
    }
  };

  // ======================= Context ========================
  const context = React.useMemo(
    () => ({
      prefixCls,
      locale,
      generateConfig,
      button: components.button,
      input: components.input,
    }),
    [prefixCls, locale, generateConfig, components.button, components.input],
  );

  // ======================== Effect ========================
  // >>> Mode
  // Reset for every active
  useLayoutEffect(() => {
    if (mergedOpen && activeIndex !== undefined) {
      // Legacy compatible. This effect update should not trigger `onPanelChange`
      triggerModeChange(null, picker, false);
    }
  }, [mergedOpen, activeIndex, picker]);

  // >>> For complex picker, we need check if need to focus next one
  useLayoutEffect(() => {
    const lastOp = lastOperation();

    // Trade as confirm on field leave
    if (!mergedOpen && lastOp === 'input') {
      triggerOpen(false);
      triggerPartConfirm(null, true);
    }

    // Submit with complex picker
    if (!mergedOpen && complexPicker && !needConfirm && lastOp === 'panel') {
      triggerOpen(true);
      triggerPartConfirm();
    }
  }, [mergedOpen]);

  // ====================== DevWarning ======================
  if (process.env.NODE_ENV !== 'production') {
    const isIndexEmpty = (index: number) => {
      return (
        // Value is empty
        !value?.[index] &&
        // DefaultValue is empty
        !defaultValue?.[index]
      );
    };

    if (
      disabled.some(
        (fieldDisabled, index) => fieldDisabled && isIndexEmpty(index) && !allowEmpty[index],
      )
    ) {
      warning(
        false,
        '`disabled` should not set with empty `value`. You should set `allowEmpty` or `value` instead.',
      );
    }
  }

  // ======================== Render ========================
  return (
    <PickerContext.Provider value={context}>
      <PickerTrigger
        popupElement={panel}
        popupStyle={styles.popup}
        popupClassName={classNames.popup}
        popupAlign={popupAlign}
        getPopupContainer={getPopupContainer}
        transitionName={transitionName}
        popupPlacement={popupPlacement}
        direction={direction}
        // Visible
        visible={mergedOpen}
        onClose={onPopupClose}
        // Range
        range
      >
        <RangeSelector
          // Shared
          {...filledProps}
          // Ref
          ref={selectorRef}
          // Icon
          suffixIcon={suffixIcon}
          // Active
          activeIndex={focused || mergedOpen ? activeIndex : null}
          activeHelp={!!internalHoverValues}
          allHelp={!!internalHoverValues && hoverSource === 'preset'}
          focused={focused}
          onFocus={onSelectorFocus}
          onBlur={onSelectorBlur}
          onKeyDown={onSelectorKeyDown}
          onSubmit={triggerPartConfirm}
          // Change
          value={hoverValues}
          maskFormat={maskFormat}
          onChange={onSelectorChange}
          onInputChange={onSelectorInputChange}
          // Format
          format={formatList}
          inputReadOnly={inputReadOnly}
          // Disabled
          disabled={disabled}
          // Open
          onOpenChange={triggerOpen}
          // Click
          onClick={onSelectorClick}
          onClear={onSelectorClear}
          // Invalid
          invalid={submitInvalidates}
          onInvalid={onSelectorInvalid}
          // Offset
          onActiveOffset={setActiveOffset}
        />
      </PickerTrigger>
    </PickerContext.Provider>
  );
}

const RefRangePicker = React.forwardRef(RangePicker) as <DateType extends object = any>(
  props: RangePickerProps<DateType> & { ref?: React.Ref<PickerRef> },
) => React.ReactElement;

if (process.env.NODE_ENV !== 'production') {
  (RefRangePicker as any).displayName = 'RefRangePicker';
}

export default RefRangePicker;

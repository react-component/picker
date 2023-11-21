import { useEvent, useMergedState } from 'rc-util';
import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import omit from 'rc-util/lib/omit';
import pickAttrs from 'rc-util/lib/pickAttrs';
import warning from 'rc-util/lib/warning';
import * as React from 'react';
import useLocale from '../hooks/useLocale';
import useTimeConfig from '../hooks/useTimeConfig';
import type {
  InternalMode,
  OnOpenChange,
  OpenConfig,
  PanelMode,
  PickerRef,
  RangeTimeProps,
  SelectorProps,
  SelectorRef,
  SharedHTMLAttrs,
  SharedPickerProps,
  ValueDate,
} from '../interface';
import type { PickerPanelProps } from '../PickerPanel';
import PickerTrigger from '../PickerTrigger';
import { fillIndex } from '../util';
import PickerContext from './context';
import useCellRender from './hooks/useCellRender';
import { useFieldFormat } from './hooks/useFieldFormat';
import useInputReadOnly from './hooks/useInputReadOnly';
import useInvalidate from './hooks/useInvalidate';
import useOpen from './hooks/useOpen';
import usePresets from './hooks/usePresets';
import useRangeActive from './hooks/useRangeActive';
import useRangeDisabledDate from './hooks/useRangeDisabledDate';
import useRangePickerValue from './hooks/useRangePickerValue';
import useRangeValue from './hooks/useRangeValue';
import useShowNow from './hooks/useShowNow';
import Popup from './Popup';
import { useClearIcon } from './Selector/hooks/useClearIcon';
import RangeSelector, { type SelectorIdType } from './Selector/RangeSelector';

function separateConfig<T>(config: T | [T, T] | null | undefined, defaultConfig: T): [T, T] {
  const singleConfig = config ?? defaultConfig;

  if (Array.isArray(singleConfig)) {
    return singleConfig;
  }

  return [singleConfig, singleConfig];
}

export type RangeValueType<DateType> = [start?: DateType, end?: DateType];

export interface RangePickerProps<DateType>
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
    info: {
      range: 'start' | 'end';
    },
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
    info: {
      source: 'reset' | 'panel';
      range: 'start' | 'end';
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
  allowEmpty?: [boolean, boolean];

  // Time
  showTime?: boolean | RangeTimeProps<DateType>;

  // Mode
  mode?: [startMode: PanelMode, endMode: PanelMode];
  onPanelChange?: (
    values: RangeValueType<DateType>,
    modes: [startMode: PanelMode, endMode: PanelMode],
  ) => void;
}

function RangePicker<DateType = any>(props: RangePickerProps<DateType>, ref: React.Ref<PickerRef>) {
  const {
    // Style
    prefixCls = 'rc-picker',
    styles = {},
    classNames = {},

    // Value
    defaultValue,
    value,
    order = true,
    needConfirm,

    // Disabled
    disabled,
    allowEmpty,
    disabledDate,

    // Open
    defaultOpen,
    open,
    onOpenChange,
    popupAlign,
    getPopupContainer,

    // Picker
    locale,
    generateConfig,
    picker = 'date',
    showNow,
    showToday,

    // Mode
    mode,
    onPanelChange,

    // Picker Value
    defaultPickerValue,
    pickerValue,
    onPickerValueChange,

    // Format
    format,
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

    // Icons
    allowClear,
    clearIcon,

    // Render
    components = {},
    cellRender,
    dateRender,
    monthCellRender,

    // Native
    onClick,
  } = props;

  // ========================= Refs =========================
  const selectorRef = React.useRef<SelectorRef>();

  React.useImperativeHandle(ref, () => ({
    nativeElement: selectorRef.current?.nativeElement,
    focus: () => {
      selectorRef.current?.focus();
    },
    blur: () => {
      selectorRef.current?.blur();
    },
  }));

  // ======================== Locale ========================
  const filledLocale = useLocale(locale);

  // =================== Disabled & Empty ===================
  const mergedDisabled = separateConfig(disabled, false);
  const mergedAllowEmpty = separateConfig(allowEmpty, false);

  // ========================= Icon =========================
  const mergedClearIcon = useClearIcon(prefixCls, allowClear, clearIcon);

  // ========================= Prop =========================
  const filledProps = React.useMemo(
    () => ({
      ...props,
      locale: filledLocale,
      allowEmpty: mergedAllowEmpty,
      order,
      picker,
    }),
    [props],
  );

  // ======================= ShowTime =======================
  const mergedShowTime = useTimeConfig(filledProps);

  // ========================= Open =========================
  const popupPlacement = direction === 'rtl' ? 'bottomRight' : 'bottomLeft';

  const [mergedOpen, setMergeOpen] = useOpen(open, defaultOpen, onOpenChange);

  const triggerOpen: OnOpenChange = (nextOpen, config?: OpenConfig) => {
    // No need to open if all disabled
    if (mergedDisabled.some((fieldDisabled) => !fieldDisabled) || !nextOpen) {
      setMergeOpen(nextOpen, config);
    }
  };

  // ======================== Picker ========================
  /** Almost same as `picker`, but add `datetime` for `date` with `showTime` */
  const internalPicker: InternalMode = picker === 'date' && mergedShowTime ? 'datetime' : picker;

  /** The picker is `datetime` or `time` */
  const complexPicker = internalPicker === 'time' || internalPicker === 'datetime';
  const mergedNeedConfirm = needConfirm ?? complexPicker;

  // ======================== Active ========================
  const [activeIndex, setActiveIndex, focused, triggerFocus, lastOperation, nextActiveIndex] =
    useRangeActive(mergedOpen, mergedDisabled, mergedAllowEmpty);

  // ========================= Mode =========================
  const [modes, setModes] = useMergedState<[PanelMode, PanelMode]>([picker, picker], {
    value: mode,
  });

  const mergedMode = modes[activeIndex] || picker;

  /** Extends from `mergedMode` to patch `datetime` mode */
  const internalMode: InternalMode =
    mergedMode === 'date' && mergedShowTime ? 'datetime' : mergedMode;

  // ====================== PanelCount ======================
  const multiplePanel = internalMode === picker && internalMode !== 'time';

  // ======================= Show Now =======================
  const mergedShowNow = useShowNow(internalPicker, mergedMode, showNow, showToday);

  // ======================== Format ========================
  const [formatList, maskFormat] = useFieldFormat(internalPicker, filledLocale, format);

  // ======================= ReadOnly =======================
  const mergedInputReadOnly = useInputReadOnly(formatList, inputReadOnly);

  // ====================== Invalidate ======================
  const isInvalidateDate = useInvalidate(generateConfig, picker, disabledDate, mergedShowTime);

  // ======================== Value =========================
  const [calendarValue, triggerCalendarChange, flushSubmit, triggerSubmitChange, emptyValue] =
    useRangeValue(
      filledProps,
      mergedDisabled,
      formatList,
      focused,
      mergedOpen,
      lastOperation,
      isInvalidateDate,
      mergedNeedConfirm,
    );

  // ===================== DisabledDate =====================
  const mergedDisabledDate = useRangeDisabledDate(
    calendarValue,
    mergedDisabled,
    activeIndex,
    generateConfig,
    filledLocale,
    disabledDate,
  );

  // ======================= Validate =======================
  const [fieldsInvalidates, setFieldsInvalidates] = React.useState<[boolean, boolean]>([
    false,
    false,
  ]);

  const onSelectorInvalid = (index: number, valid: boolean) => {
    setFieldsInvalidates((ori) => fillIndex(ori, index, valid));
  };

  const submitInvalidates = React.useMemo(() => {
    return fieldsInvalidates.map((invalid, index) => {
      // If typing invalidate
      if (invalid) {
        return true;
      }

      const current = calendarValue[index];

      // Not check if all empty
      if (!current) {
        return false;
      }

      // Not allow empty
      if (!mergedAllowEmpty[index] && !current) {
        return true;
      }

      // Invalidate
      if (current && isInvalidateDate(current)) {
        return true;
      }

      return false;
    }) as [boolean, boolean];
  }, [calendarValue, emptyValue, fieldsInvalidates, isInvalidateDate, mergedAllowEmpty]);

  // ===================== Picker Value =====================
  const [currentPickerValue, setCurrentPickerValue] = useRangePickerValue(
    generateConfig,
    filledLocale,
    calendarValue,
    mergedOpen,
    activeIndex,
    internalPicker,
    multiplePanel,
    defaultPickerValue,
    pickerValue,
    mergedShowTime?.defaultValue,
    onPickerValueChange,
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

  const onSelectorChange = (date: DateType, index: number) => {
    const clone = fillCalendarValue(date, index);

    triggerCalendarChange(clone);
  };

  const onSelectorInputChange = () => {
    lastOperation('input');
  };

  // ==================== Selector Focus ====================
  const onSelectorFocus: SelectorProps['onFocus'] = (event, index) => {
    triggerOpen(true, {
      inherit: true,
    });

    setActiveIndex(index);
    triggerFocus(true);

    onFocus?.(event);

    lastOperation('input');
  };

  const onSelectorBlur: SelectorProps['onBlur'] = (event) => {
    triggerOpen(false);

    triggerFocus(false);

    onBlur?.(event);
  };

  // ======================== Submit ========================
  /**
   * Trigger by confirm operation.
   * This function has already handle the `needConfirm` check logic.
   * - Selector: enter key
   * - Panel: OK button
   */
  const triggerPartConfirm = (date?: DateType) => {
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
    } else {
      selectorRef.current.focus(nextIndex);
    }

    // if (nextIndex === null) {
    //   triggerCalendarChange(nextValue);
    //   // triggerSubmitChange(nextValue);
    //   triggerOpen(false, { force: true });
    // } else {
    //   triggerCalendarChange(nextValue);
    //   selectorRef.current.focus(nextIndex);
    // }
  };

  // ======================== Click =========================
  const onSelectorClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (!selectorRef.current.nativeElement.contains(document.activeElement)) {
      // Click to focus the enabled input
      const enabledIndex = mergedDisabled.findIndex((d) => !d);
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
  const onPanelFocus: React.FocusEventHandler<HTMLDivElement> = () => {
    triggerFocus(true);
    triggerOpen(true);
  };

  const onPanelBlur: React.FocusEventHandler<HTMLDivElement> = () => {
    triggerFocus(false);
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
    activeIndex === 1 ? 'end' : 'start',
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
      showTime={mergedShowTime}
      // Range
      range
      multiple={multiplePanel}
      activeOffset={activeOffset}
      // Disabled
      disabledDate={mergedDisabledDate}
      // Focus
      onFocus={onPanelFocus}
      onBlur={onPanelBlur}
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
      needConfirm={mergedNeedConfirm}
      onSubmit={triggerPartConfirm}
      // Preset
      presets={presetList}
      onPresetHover={onPresetHover}
      onPresetSubmit={onPresetSubmit}
      // Render
      cellRender={onInternalCellRender}
    />
  );

  // ======================= Context ========================
  const context = React.useMemo(
    () => ({
      prefixCls,
      locale: filledLocale,
      generateConfig,
      button: components.button,
    }),
    [prefixCls, filledLocale, generateConfig, components.button],
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
      triggerPartConfirm();
    }

    // Submit with complex picker
    if (!mergedOpen && complexPicker && !mergedNeedConfirm && lastOp === 'panel') {
      triggerOpen(true);
      triggerPartConfirm();
    }
  }, [mergedOpen]);

  // ====================== DevWarning ======================
  if (process.env.NODE_ENV !== 'production') {
    const isIndexEmpty = (index: number) => {
      return (
        // Value is empty
        (value && !value[index]) ||
        // DefaultValue is empty
        (defaultValue && !defaultValue[index])
      );
    };

    if (mergedDisabled.some((fieldDisabled, index) => fieldDisabled && isIndexEmpty(index))) {
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
          clearIcon={mergedClearIcon}
          suffixIcon={suffixIcon}
          // Active
          activeIndex={focused || mergedOpen ? activeIndex : null}
          activeHelp={!!internalHoverValues}
          allHelp={!!internalHoverValues && hoverSource === 'preset'}
          focused={focused}
          onFocus={onSelectorFocus}
          onBlur={onSelectorBlur}
          onSubmit={triggerPartConfirm}
          // Change
          value={hoverValues}
          maskFormat={maskFormat}
          onChange={onSelectorChange}
          onInputChange={onSelectorInputChange}
          // Format
          format={formatList}
          inputReadOnly={mergedInputReadOnly}
          // Disabled
          disabled={mergedDisabled}
          // Open
          open={mergedOpen ? activeIndex : null}
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

const RefRangePicker = React.forwardRef(RangePicker) as <DateType>(
  props: RangePickerProps<DateType> & { ref?: React.Ref<PickerRef> },
) => React.ReactElement;

if (process.env.NODE_ENV !== 'production') {
  (RefRangePicker as any).displayName = 'RefRangePicker';
}

export default RefRangePicker;

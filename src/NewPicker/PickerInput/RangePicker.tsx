import { useEvent, useMergedState } from 'rc-util';
import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import omit from 'rc-util/lib/omit';
import warning from 'rc-util/lib/warning';
import * as React from 'react';
import useTimeConfig from '../hooks/useTimeConfig';
import type {
  CellRender,
  InternalMode,
  OnOpenChange,
  OpenConfig,
  PanelMode,
  PickerRef,
  RangeTimeProps,
  SelectorProps,
  SelectorRef,
  SharedPickerProps,
  ValueDate,
} from '../interface';
import type { PickerPanelProps } from '../PickerPanel';
import PickerTrigger from '../PickerTrigger';
import { fillIndex } from '../util';
import PickerContext from './context';
import { useFieldFormat } from './hooks/useFieldFormat';
import useInputReadOnly from './hooks/useInputReadOnly';
import useInvalidate from './hooks/useInvalidate';
import useOpen from './hooks/useOpen';
import usePresets from './hooks/usePresets';
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
    changeOnBlur,
    order = true,

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

  // =================== Disabled & Empty ===================
  const mergedDisabled = separateConfig(disabled, false);
  const mergedAllowEmpty = separateConfig(allowEmpty, false);

  // ========================= Icon =========================
  const mergedClearIcon = useClearIcon(prefixCls, allowClear, clearIcon);

  // ======================= ShowTime =======================
  const mergedShowTime = useTimeConfig(props);

  // ======================== Active ========================
  // When user first focus one input, any submit will trigger focus another one.
  // When second time focus one input, submit will not trigger focus again.
  // When click outside to close the panel, trigger event if it can trigger onChange.
  const [activeIndex, setActiveIndex] = React.useState<number>(null);
  const [focused, setFocused] = React.useState<boolean>(false);
  const lastOperationRef = React.useRef<'input' | 'panel'>(null);

  const focusedIndex = focused ? activeIndex : null;

  const [activeList, setActiveList] = React.useState<number[]>(null);

  // ========================= Mode =========================
  const [modes, setModes] = useMergedState<[PanelMode, PanelMode]>([picker, picker], {
    value: mode,
  });

  const mergedMode = modes[activeIndex] || picker;

  // ======================== Picker ========================
  /** Almost same as `picker`, but add `datetime` for `date` with `showTime` */
  const internalPicker: InternalMode = picker === 'date' && mergedShowTime ? 'datetime' : picker;

  /** Extends from `mergedMode` to patch `datetime` mode */
  const internalMode: InternalMode =
    mergedMode === 'date' && mergedShowTime ? 'datetime' : mergedMode;

  const needConfirm = internalMode === 'time' || internalMode === 'datetime';

  // ====================== PanelCount ======================
  const multiplePanel = internalMode === picker && internalMode !== 'time';

  // ======================= Show Now =======================
  const mergedShowNow = useShowNow(internalPicker, mergedMode, showNow, showToday);

  // ======================== Format ========================
  const [formatList, maskFormat] = useFieldFormat(internalPicker, locale, format);

  // ======================= ReadOnly =======================
  const mergedInputReadOnly = useInputReadOnly(formatList, inputReadOnly);

  // ========================= Open =========================
  const popupPlacement = direction === 'rtl' ? 'bottomRight' : 'bottomLeft';

  const [mergedOpen, setMergeOpen] = useOpen(open, defaultOpen, onOpenChange);

  const triggerOpen: OnOpenChange = (nextOpen, config?: OpenConfig) => {
    // No need to open if all disabled
    if (mergedDisabled.some((fieldDisabled) => !fieldDisabled) || !nextOpen) {
      setMergeOpen(nextOpen, config);
    }
  };

  // ====================== Invalidate ======================
  const isInvalidateDate = useInvalidate(generateConfig, picker, disabledDate, mergedShowTime);

  // ======================== Value =========================
  const [calendarValue, triggerCalendarChange, triggerSubmitChange, emptyValue] = useRangeValue(
    {
      ...props,
      allowEmpty: mergedAllowEmpty,
      order,
      picker,
    },
    mergedDisabled,
    formatList,
    focused,
    lastOperationRef,
    isInvalidateDate,
    needConfirm,
  );

  // ===================== DisabledDate =====================
  const mergedDisabledDate = useRangeDisabledDate(
    calendarValue,
    mergedDisabled,
    activeIndex,
    generateConfig,
    locale,
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

      // Not check if all empty
      if (emptyValue) {
        return false;
      }

      const current = calendarValue[index];

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
    locale,
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
  const fillMergedValue = (date: DateType, index: number) =>
    // Trigger change only when date changed
    fillIndex(calendarValue, index, date);

  const onSelectorChange = (date: DateType, index: number) => {
    const clone = fillMergedValue(date, index);

    triggerCalendarChange(clone);
  };

  const onSelectorInputChange = () => {
    lastOperationRef.current = 'input';
  };

  // ==================== Selector Focus ====================
  const onSelectorFocus: SelectorProps['onFocus'] = (event, index) => {
    setActiveIndex(index);
    setFocused(true);

    onFocus?.(event);
  };

  const onSelectorBlur: SelectorProps['onBlur'] = (event) => {
    setFocused(false);

    // Always trigger submit since input is always means confirm
    triggerCalendarChange(calendarValue);

    onBlur?.(event);
  };

  // ======================== Submit ========================
  const hasDisabled = mergedDisabled.some((disabledItem) => disabledItem);

  const triggerChangeAndFocusNext = (date?: DateType) => {
    let nextValue = calendarValue;

    if (date) {
      nextValue = fillMergedValue(date, activeIndex);
    }

    // Focus or blur the open panel
    const activeLen = activeList?.length;
    if (activeLen > 1 || hasDisabled) {
      // Close anyway
      triggerOpen(false, { index: activeIndex, force: true });
      triggerSubmitChange(nextValue);
    } else if (activeLen === 1) {
      // Trigger
      triggerCalendarChange(nextValue);

      // Open to the next field
      selectorRef.current.focus(activeList[0] === 0 ? 1 : 0);
    }
  };

  // ======================== Click =========================
  const onSelectorClick: React.MouseEventHandler<HTMLDivElement> = () => {
    if (focusedIndex === null) {
      // Click to focus the enabled input
      const enabledIndex = mergedDisabled.findIndex((d) => !d);
      if (enabledIndex >= 0) {
        selectorRef.current.focus(enabledIndex);
      }
    }

    triggerOpen(true);
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
    triggerSubmitChange(nextValues);
    triggerOpen(false, { force: true });
  };

  // ======================== Panel =========================
  const onPanelHover = (date: DateType) => {
    setInternalHoverValues(date ? fillMergedValue(date, activeIndex) : null);
    setHoverSource('cell');
  };

  // >>> Focus
  const onPanelFocus: React.FocusEventHandler<HTMLDivElement> = () => {
    setFocused(true);
    triggerOpen(true);
  };

  const onPanelBlur: React.FocusEventHandler<HTMLDivElement> = () => {
    setFocused(false);
  };

  // >>> Calendar
  const onPanelCalendarChange: PickerPanelProps<DateType>['onChange'] = (date) => {
    lastOperationRef.current = 'panel';

    const clone: RangeValueType<DateType> = fillIndex(calendarValue, activeIndex, date);

    if (mergedMode === picker && !needConfirm) {
      triggerChangeAndFocusNext(date);
    } else {
      triggerCalendarChange(clone);
    }
  };

  // >>> Close
  const onPopupClose = () => {
    if (changeOnBlur) {
      triggerCalendarChange(calendarValue);
    }

    // Close popup
    triggerOpen(false);
  };

  // >>> cellRender
  const onInternalCellRender: CellRender<DateType> = (date, info) => {
    return cellRender(date, {
      ...info,
      range: activeIndex === 1 ? 'end' : 'start',
    });
  };

  // >>> Value
  const panelValue = calendarValue[activeIndex] || null;

  // >>> invalid
  const panelValueInvalid = !panelValue || isInvalidateDate(panelValue);

  // >>> Render
  const panel = (
    <Popup
      // MISC
      {...omit(props, [
        'onChange',
        'onCalendarChange',
        'style',
        'className',
        'id',
        'onPanelChange',
      ])}
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
      invalid={panelValueInvalid}
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
      onSubmit={triggerChangeAndFocusNext}
      // Preset
      presets={presetList}
      onPresetHover={onPresetHover}
      onPresetSubmit={onPresetSubmit}
      // Render
      cellRender={cellRender ? onInternalCellRender : undefined}
    />
  );

  // ======================= Context ========================
  const context = React.useMemo(
    () => ({
      prefixCls,
      locale,
      generateConfig,
      button: components.button,
    }),
    [prefixCls, locale, generateConfig, components.button],
  );

  // ======================== Effect ========================
  // >>> Active: Reset list
  React.useEffect(() => {
    if (!mergedOpen) {
      setActiveList(null);
    } else if (activeIndex !== null) {
      setActiveList((ori) => {
        const list = [...(ori || [])];
        return list[list.length - 1] === activeIndex ? ori : [...list, activeIndex];
      });
    }
  }, [activeIndex, mergedOpen]);

  // >>> Mode
  // Reset for every active
  useLayoutEffect(() => {
    if (mergedOpen && activeIndex !== undefined) {
      // Legacy compatible. This effect update should not trigger `onPanelChange`
      triggerModeChange(null, picker, false);
    }
  }, [mergedOpen, activeIndex, picker]);

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
          {...props}
          // Ref
          ref={selectorRef}
          // Icon
          clearIcon={mergedClearIcon}
          suffixIcon={suffixIcon}
          // Active
          activeIndex={focusedIndex}
          activeHelp={!!internalHoverValues}
          allHelp={!!internalHoverValues && hoverSource === 'preset'}
          onFocus={onSelectorFocus}
          onBlur={onSelectorBlur}
          onSubmit={triggerChangeAndFocusNext}
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
          open={mergedOpen ? focusedIndex : null}
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

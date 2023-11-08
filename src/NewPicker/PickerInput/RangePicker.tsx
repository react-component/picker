import { useMergedState } from 'rc-util';
import omit from 'rc-util/lib/omit';
import warning from 'rc-util/lib/warning';
import * as React from 'react';
import useShowTime from '../hooks/useShowTime';
import type {
  InternalMode,
  OnOpenChange,
  OpenConfig,
  SelectorProps,
  SelectorRef,
  SharedPickerProps,
  ValueDate,
} from '../interface';
import type { PickerPanelProps } from '../PickerPanel';
import PickerTrigger from '../PickerTrigger';
import PickerContext from './context';
import { useFieldFormat } from './hooks/useFieldFormat';
import useInvalidate from './hooks/useInvalidate';
import useOpen from './hooks/useOpen';
import usePresets from './hooks/usePresets';
import useRangeDisabledDate from './hooks/useRangeDisabledDate';
import useRangePickerValue from './hooks/useRangePickerValue';
import useRangeValue from './hooks/useRangeValue';
import useShowNow from './hooks/useShowNow';
import Popup from './Popup';
import { useClearIcon } from './Selector/hooks/useClearIcon';
import RangeSelector from './Selector/RangeSelector';

function separateConfig<T>(config: T | [T, T] | null | undefined, defaultConfig: T): [T, T] {
  const singleConfig = config ?? defaultConfig;

  if (Array.isArray(singleConfig)) {
    return singleConfig;
  }

  return [singleConfig, singleConfig];
}

export type RangeValueType<DateType> = [start?: DateType, end?: DateType];

export interface RangePickerProps<DateType> extends SharedPickerProps<DateType> {
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
}

export default function Picker<DateType = any>(props: RangePickerProps<DateType>) {
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
    mode,
    onModeChange,
    showTime,
    showNow,
    showToday,

    // Picker Value
    defaultPickerValue,
    pickerValue,
    onPickerValueChange,

    // Format
    format,

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
  } = props;

  const selectorRef = React.useRef<SelectorRef>();

  // =================== Disabled & Empty ===================
  const mergedDisabled = separateConfig(disabled, false);
  const mergedAllowEmpty = separateConfig(allowEmpty, false);

  // ========================= Icon =========================
  const mergedClearIcon = useClearIcon(prefixCls, allowClear, clearIcon);

  // ======================= ShowTime =======================
  const mergedShowTime = useShowTime(showTime);

  // ======================== Picker ========================
  const [mergedMode, setMergedMode] = useMergedState(picker, {
    value: mode,
    onChange: onModeChange,
  });

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

  // ========================= Open =========================
  const popupPlacement = direction === 'rtl' ? 'bottomRight' : 'bottomLeft';

  const [mergedOpen, setMergeOpen] = useOpen(open, defaultOpen, onOpenChange);

  const triggerOpen: OnOpenChange = (nextOpen, config?: OpenConfig) => {
    // No need to open if all disabled
    if (mergedDisabled.some((fieldDisabled) => !fieldDisabled) || !nextOpen) {
      setMergeOpen(nextOpen, config);
    }
  };

  // ======================== Active ========================
  // When user first focus one input, any submit will trigger focus another one.
  // When second time focus one input, submit will not trigger focus again.
  // When click outside to close the panel, trigger event if it can trigger onChange.
  const [activeIndex, setActiveIndex] = React.useState<number>(null);
  const [focused, setFocused] = React.useState<boolean>(false);
  const blurRef = React.useRef<'input' | 'panel'>(null);

  const focusedIndex = focused ? activeIndex : null;

  const [activeList, setActiveList] = React.useState<number[]>(null);

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
    blurRef,
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
  const isInvalidRange = React.useMemo(() => {
    // Not check if get focused
    if (focused || emptyValue) {
      return false;
    }

    const [start, end] = calendarValue;

    if (
      // No start
      (!mergedAllowEmpty[0] && !start) ||
      // No end
      (!mergedAllowEmpty[1] && !end)
    ) {
      return true;
    }

    if (
      // Invalidate start
      (start && isInvalidateDate(start)) ||
      // Invalidate end
      (end && isInvalidateDate(end))
    ) {
      return true;
    }

    return false;
  }, [focused, emptyValue, calendarValue, mergedAllowEmpty, isInvalidateDate]);

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
    onPickerValueChange,
  );

  // ======================== Change ========================
  const fillMergedValue = (date: DateType, index: number) => {
    // Trigger change only when date changed
    const [prevStart, prevEnd] = calendarValue;

    const clone: RangeValueType<DateType> = [prevStart, prevEnd];
    clone[index] = date;

    return clone;
  };

  const onSelectorChange = (date: DateType, index: number) => {
    const clone = fillMergedValue(date, index);

    triggerCalendarChange(clone);
  };

  // ==================== Selector Focus ====================
  const onSelectorFocus: SelectorProps['onFocus'] = (event, index) => {
    setActiveIndex(index);
    setFocused(true);

    onFocus?.(event);
  };

  const onSelectorBlur: SelectorProps['onBlur'] = (event) => {
    blurRef.current = 'input';
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

  // ========================================================
  // ==                       Panels                       ==
  // ========================================================

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
    blurRef.current = 'panel';
    setFocused(false);
  };

  // >>> Calendar
  const onPanelCalendarChange: PickerPanelProps<DateType>['onChange'] = (date) => {
    const clone: RangeValueType<DateType> = [...calendarValue];
    clone[activeIndex] = date;

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

  // >>> Value
  const panelValue = calendarValue[activeIndex] || null;

  // >>> Render
  const panel = (
    <Popup
      // MISC
      {...omit(props, ['onChange', 'onCalendarChange', 'style', 'className'])}
      showNow={mergedShowNow}
      showTime={mergedShowTime}
      multiple={multiplePanel}
      // Disabled
      disabledDate={mergedDisabledDate}
      // Focus
      onFocus={onPanelFocus}
      onBlur={onPanelBlur}
      // Mode
      picker={picker}
      mode={mergedMode}
      internalMode={internalMode}
      onModeChange={setMergedMode}
      // Value
      value={panelValue}
      onChange={null}
      onCalendarChange={onPanelCalendarChange}
      // PickerValue
      pickerValue={currentPickerValue}
      onPickerValueChange={setCurrentPickerValue}
      //Hover
      hoverValue={hoverValues}
      onHover={onPanelHover}
      // Submit
      needConfirm={needConfirm}
      onSubmit={triggerChangeAndFocusNext}
      // Preset
      presets={presetList}
      onPresetHover={onPresetHover}
      onPresetSubmit={onPresetSubmit}
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
          format={formatList}
          maskFormat={maskFormat}
          onChange={onSelectorChange}
          // Disabled
          disabled={mergedDisabled}
          // Open
          open={mergedOpen ? focusedIndex : null}
          onOpenChange={triggerOpen}
          // Click
          onClick={onSelectorClick}
          onClear={onSelectorClear}
          // Invalid
          invalid={isInvalidRange}
        />
      </PickerTrigger>
    </PickerContext.Provider>
  );
}

import { useMergedState } from 'rc-util';
import * as React from 'react';
import useShowTime from '../hooks/useShowTime';
import type {
  InternalMode,
  OnOpenChange,
  OpenConfig,
  SelectorProps,
  SelectorRef,
  SharedPickerProps,
} from '../interface';
import type { PickerPanelProps } from '../PickerPanel';
import PickerTrigger from '../PickerTrigger';
import PickerContext from './context';
import { useFieldFormat } from './hooks/useFieldFormat';
import useInvalidate from './hooks/useInvalidate';
import useOpen from './hooks/useOpen';
import useRangeDisabledDate from './hooks/useRangeDisabledDate';
import useRangeValue from './hooks/useRangeValue';
import useShowNow from './hooks/useShowNow';
import Popup from './Popup';
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

  // Picker Value
  /**
   * Config the popup panel date.
   * Every time active the input to open popup will reset with `defaultPickerValue`
   */
  defaultPickerValue?: [DateType, DateType] | null;
  pickerValue?: [DateType, DateType] | null;
  onPickerValueChange?: (date: [DateType, DateType]) => void;

  // range
  /** Default will always order of selection after submit */
  order?: boolean;

  // Control
  disabled?: boolean | [boolean, boolean];
  allowEmpty?: [boolean, boolean];
}

export default function Picker<DateType = any>(props: RangePickerProps<DateType>) {
  const {
    // Style
    prefixCls = 'rc-picker',
    className,
    style,
    styles = {},
    classNames = {},

    // Value
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

    // Render
    components = {},
  } = props;

  const selectorRef = React.useRef<SelectorRef>();

  // ======================= ShowTime =======================
  const mergedShowTime = useShowTime(showTime);

  // ======================== Picker ========================
  const [mergedMode, setMergedMode] = useMergedState(picker, {
    value: mode,
    onChange: onModeChange,
  });

  const internalPicker: InternalMode = picker === 'date' && mergedShowTime ? 'datetime' : picker;

  /** Extends from `mergedMode` to patch `datetime` mode */
  const internalMode: InternalMode =
    mergedMode === 'date' && mergedShowTime ? 'datetime' : mergedMode;

  const needConfirm = internalMode === 'time' || internalMode === 'datetime';

  // ======================= Show Now =======================
  const mergedShowNow = useShowNow(internalPicker, mergedMode, showNow, showToday);

  // ======================== Format ========================
  const [formatList, maskFormat] = useFieldFormat(internalPicker, locale, format);

  // ========================= Open =========================
  const popupPlacement = direction === 'rtl' ? 'bottomRight' : 'bottomLeft';

  const [mergedOpen, setMergeOpen] = useOpen(open, defaultOpen, onOpenChange);

  const onSelectorOpenChange: OnOpenChange = (nextOpen, index, config?: OpenConfig) => {
    setMergeOpen(nextOpen, config);
  };

  // ======================== Active ========================
  // When user first focus one input, any submit will trigger focus another one.
  // When second time focus one input, submit will not trigger focus again.
  // When click outside to close the panel, trigger event if it can trigger onChange.
  const [activeIndex, setActiveIndex] = React.useState<number>(null);
  const [focused, setFocused] = React.useState<boolean>(false);

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

  // =================== Disabled & Empty ===================
  const mergedDisabled = separateConfig(disabled, false);
  const mergedAllowEmpty = separateConfig(allowEmpty, false);

  const isInvalidateDate = useInvalidate(generateConfig, picker, disabledDate, mergedShowTime);

  // ======================== Order =========================
  // When exist disabled, it should not support order
  const orderOnChange = mergedDisabled.some((d) => d) ? false : order;

  // ======================== Value =========================
  const [calendarValue, triggerCalendarChange, triggerSubmitChange] = useRangeValue(
    {
      ...props,
      formatList,
      allowEmpty: mergedAllowEmpty,
      focused,
      order,
      picker,
    },
    orderOnChange,
    isInvalidateDate,
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
    if (focused) {
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
  }, [focused, calendarValue, mergedAllowEmpty, isInvalidateDate]);

  // ===================== Picker Value =====================
  const [mergedStartPickerValue, setStartPickerValue] = useMergedState(
    () => defaultPickerValue?.[0] || calendarValue?.[0] || generateConfig.getNow(),
    {
      value: pickerValue?.[0],
    },
  );

  const [mergedEndPickerValue, setEndPickerValue] = useMergedState(
    () => defaultPickerValue?.[1] || calendarValue?.[1] || generateConfig.getNow(),
    {
      value: pickerValue?.[1],
    },
  );

  const currentPickerValue = [mergedStartPickerValue, mergedEndPickerValue][activeIndex];
  const setCurrentPickerValue = (nextPickerValue: DateType) => {
    const updater = [setStartPickerValue, setEndPickerValue][activeIndex];
    updater(nextPickerValue);

    const clone: [DateType, DateType] = [mergedStartPickerValue, mergedEndPickerValue];
    clone[activeIndex] = nextPickerValue;
    onPickerValueChange?.(clone);
  };

  // Resync to `defaultPickerValue` for each panel focused
  React.useEffect(() => {
    if (mergedOpen && focusedIndex !== null) {
      if (focusedIndex === 0 && defaultPickerValue[0]) {
        setStartPickerValue(defaultPickerValue[0]);
      } else if (focusedIndex === 1 && defaultPickerValue[1]) {
        setEndPickerValue(defaultPickerValue[1]);
      }
    }
  }, [mergedOpen, focusedIndex]);

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
      onSelectorOpenChange(false, activeIndex);
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

    setMergeOpen(true);
  };

  // ======================== Hover =========================
  const [hoverDate, setHoverDate] = React.useState<DateType>(null);

  const hoverValues = React.useMemo(() => {
    const clone: RangeValueType<DateType> = [...calendarValue];

    if (hoverDate) {
      clone[activeIndex] = hoverDate;
    }

    return clone;
  }, [calendarValue, hoverDate, activeIndex]);

  // ========================================================
  // ==                       Panels                       ==
  // ========================================================
  const onPanelHover = (date: DateType) => {
    setHoverDate(date);
  };

  // >>> Focus
  const onPanelFocus: React.FocusEventHandler<HTMLDivElement> = () => {
    setFocused(true);
    setMergeOpen(true);
  };

  const onPanelBlur: React.FocusEventHandler<HTMLDivElement> = () => {
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
    setMergeOpen(false);
  };

  // >>> Value
  const panelValue = calendarValue[activeIndex] || null;

  // >>> Render
  const panel = (
    <Popup
      // MISC
      {...(props as Omit<RangePickerProps<DateType>, 'onChange' | 'onCalendarChange'>)}
      showNow={mergedShowNow}
      showTime={mergedShowTime}
      range
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
          suffixIcon={suffixIcon}
          // Active
          activeIndex={focusedIndex}
          activeHelp={!!hoverDate}
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
          onOpenChange={onSelectorOpenChange}
          // Click
          onClick={onSelectorClick}
          // Invalid
          invalid={isInvalidRange}
        />
      </PickerTrigger>
    </PickerContext.Provider>
  );
}

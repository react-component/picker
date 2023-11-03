import { useMergedState } from 'rc-util';
import * as React from 'react';
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
import useOpen from './hooks/useOpen';
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
  defaultPickerValue?: [DateType, DateType] | null;
  pickerValue?: [DateType, DateType] | null;
  onPickerValueChange?: (date: [DateType, DateType]) => void;

  // MISC
  order?: boolean;

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

    disabled,
    allowEmpty,

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

  // ======================== Picker ========================
  const [mergedMode, setMergedMode] = useMergedState(picker, {
    value: mode,
    onChange: onModeChange,
  });

  const internalPicker: InternalMode = picker === 'date' && showTime ? 'datetime' : picker;

  /** Extends from `mergedMode` to patch `datetime` mode */
  const internalMode: InternalMode = mergedMode === 'date' && showTime ? 'datetime' : mergedMode;

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

  // ======================== Value =========================
  const [mergedValue, triggerCalendarChange, triggerSubmitChange] = useRangeValue({
    ...props,
    formatList,
    allowEmpty: mergedAllowEmpty,
    focused,
  });

  // ===================== Picker Value =====================
  const [mergedStartPickerValue, setStartPickerValue] = useMergedState(
    () => defaultPickerValue?.[0] || mergedValue?.[0] || generateConfig.getNow(),
    {
      value: pickerValue?.[0],
    },
  );

  const [mergedEndPickerValue, setEndPickerValue] = useMergedState(
    () => defaultPickerValue?.[1] || mergedValue?.[1] || generateConfig.getNow(),
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

  // ======================== Change ========================
  const fillMergedValue = (date: DateType, index: number) => {
    // Trigger change only when date changed
    const [prevStart, prevEnd] = mergedValue;

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
    triggerCalendarChange(mergedValue);

    onBlur?.(event);
  };

  // ======================== Submit ========================
  const triggerChangeAndFocusNext = (date?: DateType) => {
    let nextValue = mergedValue;

    if (date) {
      nextValue = fillMergedValue(date, activeIndex);
    }

    // Focus or blur the open panel
    const activeLen = activeList?.length;
    if (activeLen === 1) {
      // Trigger
      triggerCalendarChange(nextValue);

      // Open to the next field
      selectorRef.current.focus(activeList[0] === 0 ? 1 : 0);
    } else if (activeLen > 1) {
      // Close anyway
      onSelectorOpenChange(false, activeIndex);
      triggerSubmitChange(nextValue);
    }
  };

  // ======================== Click =========================
  const onSelectorClick: React.MouseEventHandler<HTMLDivElement> = () => {
    if (focusedIndex === null) {
      selectorRef.current.focus(0);
    }

    setMergeOpen(true);
  };

  // ======================== Panels ========================
  const onPanelFocus: React.FocusEventHandler<HTMLDivElement> = () => {
    setFocused(true);
    setMergeOpen(true);
  };

  const onPanelBlur: React.FocusEventHandler<HTMLDivElement> = () => {
    setFocused(false);
  };

  const onPanelCalendarChange: PickerPanelProps<DateType>['onChange'] = (date) => {
    const clone: RangeValueType<DateType> = [...mergedValue];
    clone[activeIndex] = date;

    if (mergedMode === picker && !needConfirm) {
      triggerChangeAndFocusNext(date);
    } else {
      triggerCalendarChange(clone);
    }
  };

  const onPopupClose = () => {
    if (changeOnBlur) {
      triggerCalendarChange(mergedValue);
    }

    // Close popup
    setMergeOpen(false);
  };

  const panelValue = mergedValue[activeIndex] || null;

  const panel = (
    <Popup
      // MISC
      {...(props as Omit<RangePickerProps<DateType>, 'onChange' | 'onCalendarChange'>)}
      showNow={mergedShowNow}
      range
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
          onFocus={onSelectorFocus}
          onBlur={onSelectorBlur}
          onSubmit={triggerChangeAndFocusNext}
          // Change
          value={mergedValue}
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
        />
      </PickerTrigger>
    </PickerContext.Provider>
  );
}

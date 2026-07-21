import {
  omit,
  pickAttrs,
  useControlledState,
  useEvent,
  useLayoutEffect,
  warning,
} from '@rc-component/util';
import { clsx } from 'clsx';
import * as React from 'react';
import type {
  BaseInfo,
  InternalMode,
  OnOpenChange,
  OpenConfig,
  PanelMode,
  RangePickerRef,
  RangeTimeProps,
  SelectorProps,
  SharedHTMLAttrs,
  SharedPickerProps,
  ValueDate,
} from '../interface';
import type { PickerPanelProps } from '../PickerPanel';
import PickerTrigger from '../PickerTrigger';
import { pickTriggerProps } from '../PickerTrigger/util';
import { fillIndex, getFromDate, toArray } from '../utils/miscUtil';
import PickerContext from './context';
import useCellRender from './hooks/useCellRender';
import useFieldsInvalidate from './hooks/useFieldsInvalidate';
import useFilledProps from './hooks/useFilledProps';
import useFocusEvents, { isTargetInContainers } from './hooks/useFocusEvents';
import useFocusLock from './hooks/useFocusLock';
import useOpen from './hooks/useOpen';
import usePickerRef from './hooks/usePickerRef';
import usePresets from './hooks/usePresets';
import useRangeDisabledDate from './hooks/useRangeDisabledDate';
import useRangePickerValue from './hooks/useRangePickerValue';
import useRangeValue, { useInnerValue } from './hooks/useRangeValue';
import useRangeValueChange, { type RangeValueChangeSource } from './hooks/useRangeValueChange';
import useShowNow from './hooks/useShowNow';
import Popup, { type PopupShowTimeConfig } from './Popup';
import RangeSelector, {
  type RangeSelectorRef,
  type SelectorIdType,
} from './Selector/RangeSelector';
import useSemantic from '../hooks/useSemantic';

function separateConfig<T>(config: T | [T, T] | null | undefined, defaultConfig: T): [T, T] {
  const singleConfig = config ?? defaultConfig;

  if (Array.isArray(singleConfig)) {
    return singleConfig;
  }

  return [singleConfig, singleConfig];
}

export type RangeValueType<DateType> = [
  start: DateType | null | undefined,
  end: DateType | null | undefined,
];

/** Used for change event, it should always be not undefined */
export type NoUndefinedRangeValueType<DateType> = [start: DateType | null, end: DateType | null];

export interface BaseRangePickerProps<DateType extends object> extends Omit<
  SharedPickerProps<DateType>,
  'showTime' | 'id'
> {
  // Structure
  id?: SelectorIdType;

  separator?: React.ReactNode;

  // Value
  value?: RangeValueType<DateType> | null;
  defaultValue?: RangeValueType<DateType>;
  onChange?: (
    dates: NoUndefinedRangeValueType<DateType> | null,
    dateStrings: [string, string],
  ) => void;
  onCalendarChange?: (
    dates: NoUndefinedRangeValueType<DateType>,
    dateStrings: [string, string],
    info: BaseInfo,
  ) => void;
  onOk?: (values: NoUndefinedRangeValueType<DateType>) => void;

  // Placeholder
  placeholder?: [string, string];

  // Picker Value
  /**
   * Config the popup panel date.
   * Every time active the input to open popup will reset with `defaultPickerValue`.
   *
   * Note: `defaultPickerValue` priority is higher than `value` for the first open.
   */
  defaultPickerValue?: [DateType, DateType] | DateType | null;
  /**
   * Config each start & end field popup panel date.
   * When config `pickerValue`, you must also provide `onPickerValueChange` to handle changes.
   */
  pickerValue?: [DateType, DateType] | DateType | null;
  /**
   * Each popup panel `pickerValue` includes `mode` change will trigger the callback.
   * @param date The changed picker value
   * @param info.source `panel` from the panel click. `reset` from popup open or field typing
   * @param info.mode Next `mode` panel
   */
  onPickerValueChange?: (
    date: [DateType, DateType],
    info: BaseInfo & {
      source: 'reset' | 'panel';
      mode: [PanelMode, PanelMode];
    },
  ) => void;

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
  /** Trigger on each `mode` or `pickerValue` changed. */
  onPanelChange?: (
    values: NoUndefinedRangeValueType<DateType>,
    modes: [startMode: PanelMode, endMode: PanelMode],
  ) => void;
}

export interface RangePickerProps<DateType extends object>
  extends
    BaseRangePickerProps<DateType>,
    Omit<RangeTimeProps<DateType>, 'format' | 'defaultValue' | 'defaultOpenValue'> {}

function getActiveRange(activeIndex: number) {
  return activeIndex === 1 ? 'end' : 'start';
}

function RangePicker<DateType extends object = any>(
  props: RangePickerProps<DateType>,
  ref: React.Ref<RangePickerRef>,
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
    rootClassName,
    styles: propStyles,
    classNames: propClassNames,

    previewValue,
    // Value
    defaultValue,
    value,
    needConfirm,
    onClear,
    onKeyDown,

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
    onOk,

    // Picker Value
    defaultPickerValue,
    pickerValue,
    onPickerValueChange,

    // Format
    inputReadOnly,

    suffixIcon,

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
  const selectorRef = usePickerRef<Parameters<RangePickerRef['focus']>[0], RangeSelectorRef>(ref);
  const popupRef = React.useRef<HTMLDivElement>(null);

  // ======================= Semantic =======================
  const [mergedClassNames, mergedStyles] = useSemantic(propClassNames, propStyles);

  // ========================= Open =========================
  const [mergedOpen, setMergeOpen] = useOpen(open, defaultOpen, disabled, onOpenChange);

  const triggerOpen: OnOpenChange = (nextOpen, config?: OpenConfig) => {
    // No need to open if all disabled
    if (disabled.some((fieldDisabled) => !fieldDisabled) || !nextOpen) {
      setMergeOpen(nextOpen, config);
    }
  };

  // ======================== Values ========================
  const [mergedValue, setInnerValue, getCalendarValue, triggerCalendarChange, triggerOk] =
    useInnerValue(
      generateConfig,
      locale,
      formatList,
      true,
      false,
      defaultValue,
      value,
      onCalendarChange,
      onOk,
    );

  const calendarValue = getCalendarValue();

  // ======================== Focus =========================
  const isInternalPickerElement = useEvent((element: EventTarget | null) =>
    isTargetInContainers(element, [selectorRef.current.nativeElement, popupRef.current]),
  );

  const [focused, onFieldFocus, onFieldBlur] = useFocusEvents(
    isInternalPickerElement,
    (index, event) => {
      onFocus?.(event, {
        range: getActiveRange(index),
      });
    },
    (index, event) => {
      triggerRangeValueChange(index, 'blur');
      triggerOpen(false);

      onBlur?.(event, {
        range: getActiveRange(index),
      });
    },
  );

  // ======================== Value =========================
  const [
    /** Trigger `onChange` by check `disabledDate` */
    flushSubmit,
    /** Trigger `onChange` directly without check `disabledDate` */
    triggerSubmitChange,
    /** Reset uncommitted values */
    resetValue,
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
    // false,
  );

  const triggerFieldCalendarChange = useEvent((index: number, date: DateType) => {
    triggerCalendarChange(fillIndex(getCalendarValue(), index, date));
  });

  const flushFieldSubmit = useEvent((index: number, needTriggerChange: boolean) => {
    flushSubmit(index, needTriggerChange);

    if (needTriggerChange) {
      triggerOpen(false, { force: true });
    }
  });

  const enabledFieldCount = disabled.filter((fieldDisabled) => !fieldDisabled).length;
  const [rangeValueIndex, activeIndex, triggeredFields, triggerRangeValueChange] =
    useRangeValueChange(
      enabledFieldCount,
      needConfirm,
      allowEmpty,
      getCalendarValue,
      triggerFieldCalendarChange,
      flushFieldSubmit,
      resetValue,
    );

  useFocusLock(rangeValueIndex, selectorRef, popupRef, triggerOpen);

  // ======================= ShowTime =======================
  /** Used for Popup panel */
  const mergedShowTime = React.useMemo<
    PopupShowTimeConfig<DateType> & Pick<RangeTimeProps<DateType>, 'defaultOpenValue'>
  >(() => {
    if (!showTime) {
      return null;
    }

    const { disabledTime } = showTime;

    const proxyDisabledTime = disabledTime
      ? (date: DateType) => {
          const range = getActiveRange(activeIndex);
          const fromDate = getFromDate(calendarValue, triggeredFields, activeIndex);
          return disabledTime(date, range, {
            from: fromDate,
          });
        }
      : undefined;

    return { ...showTime, disabledTime: proxyDisabledTime };
  }, [showTime, activeIndex, calendarValue, triggeredFields]);

  // ========================= Mode =========================
  const [modes, setModes] = useControlledState<[PanelMode, PanelMode]>([picker, picker], mode);

  const mergedMode = modes[activeIndex] || picker;

  /** Extends from `mergedMode` to patch `datetime` mode */
  const internalMode: InternalMode =
    mergedMode === 'date' && mergedShowTime ? 'datetime' : mergedMode;

  // ====================== PanelCount ======================
  const multiplePanel = internalMode === picker && internalMode !== 'time';

  // ======================= Show Now =======================
  const mergedShowNow = useShowNow(picker, mergedMode, showNow, showToday, true);

  // ===================== DisabledDate =====================
  const mergedDisabledDate = useRangeDisabledDate(
    calendarValue,
    disabled,
    activeIndex,
    triggeredFields,
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
    modes,
    mergedOpen,
    activeIndex,
    internalPicker,
    multiplePanel,
    defaultPickerValue,
    pickerValue,
    mergedShowTime?.defaultOpenValue,
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
  const triggerPartConfirm = (date?: DateType, source: RangeValueChangeSource = 'confirm') => {
    triggerRangeValueChange(activeIndex, source, date ?? undefined);
  };

  // ======================== Click =========================
  const onSelectorClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const rootNode = (event.target as HTMLElement).getRootNode();
    if (
      !selectorRef.current.nativeElement.contains(
        (rootNode as Document | ShadowRoot).activeElement ?? document.activeElement,
      )
    ) {
      // Click to focus the enabled input
      const enabledIndex = disabled.findIndex((d) => !d);
      if (enabledIndex >= 0) {
        selectorRef.current.focus({ index: enabledIndex });
      }
    }

    triggerOpen(true);

    onClick?.(event);
  };

  const onSelectorClear = () => {
    triggerSubmitChange(null);
    triggerOpen(false, { force: true });
    onClear?.();
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
  // Save the offset with active bar position
  // const [activeOffset, setActiveOffset] = React.useState(0);
  const [activeInfo, setActiveInfo] = React.useState<
    [activeInputLeft: number, activeInputRight: number, selectorWidth: number]
  >([0, 0, 0]);

  const onSetHover = (date: RangeValueType<DateType> | null, source: 'cell' | 'preset') => {
    if (previewValue !== 'hover') {
      return;
    }
    setInternalHoverValues(date);
    setHoverSource(source);
  };

  // ======================= Presets ========================
  const presetList = usePresets(presets, ranges);

  const onPresetHover = (nextValues: RangeValueType<DateType> | null) => {
    onSetHover(nextValues, 'preset');
  };

  const onPresetSubmit = (nextValues: RangeValueType<DateType>) => {
    const passed = triggerSubmitChange(nextValues);

    if (passed) {
      triggerOpen(false, { force: true });
    }
  };

  const onNow = (now: DateType) => {
    triggerPartConfirm(now);
  };

  // ======================== Panel =========================
  const onPanelHover = (date: DateType) => {
    onSetHover(date ? fillCalendarValue(date, activeIndex) : null, 'cell');
  };

  // >>> Focus
  const onPanelFocus: React.FocusEventHandler<HTMLElement> = (event) => {
    triggerOpen(true);
    onFieldFocus(activeIndex, 'panel', event);
  };

  // >>> Calendar
  const onPanelSelect: PickerPanelProps<DateType>['onChange'] = (date: DateType) => {
    const panelFinished = !complexPicker && internalPicker === internalMode;

    triggerRangeValueChange(
      activeIndex,
      panelFinished ? 'panel-final' : 'panel-intermediate',
      date,
    );
  };

  // >>> Close
  const onPopupClose = () => {
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
  const isPopupInvalidateDate = useEvent((date: DateType) => {
    return isInvalidateDate(date, {
      activeIndex,
    });
  });

  const panelProps = React.useMemo(() => {
    const domProps = pickAttrs(filledProps, false);
    const restProps = omit(filledProps, [
      ...(Object.keys(domProps) as (keyof SharedHTMLAttrs)[]),
      'onChange',
      'onCalendarChange',
      'onClear',
      'style',
      'className',
      'onPanelChange',
      'disabledTime',
      'classNames',
      'styles',
    ]);
    return restProps;
  }, [filledProps]);

  // >>> Render
  const panel = (
    <Popup<any>
      containerRef={popupRef}
      // MISC
      {...panelProps}
      showNow={mergedShowNow}
      showTime={mergedShowTime}
      // Range
      range
      multiplePanel={multiplePanel}
      activeInfo={activeInfo}
      // Disabled
      disabledDate={mergedDisabledDate}
      // Focus
      onFocus={onPanelFocus}
      onBlur={(event) => onFieldBlur(activeIndex, 'panel', event)}
      // Mode
      picker={picker}
      mode={mergedMode}
      internalMode={internalMode}
      onPanelChange={triggerModeChange}
      // Value
      format={maskFormat}
      value={panelValue}
      isInvalid={isPopupInvalidateDate}
      onChange={null}
      onSelect={onPanelSelect}
      // PickerValue
      pickerValue={currentPickerValue}
      defaultOpenValue={toArray(showTime?.defaultOpenValue)[activeIndex]}
      onPickerValueChange={setCurrentPickerValue}
      // Hover
      hoverValue={hoverValues}
      onHover={onPanelHover}
      // Submit
      needConfirm={needConfirm}
      onSubmit={(date) => triggerPartConfirm(date, 'confirm')}
      onOk={triggerOk}
      // Preset
      presets={presetList}
      onPresetHover={onPresetHover}
      onPresetSubmit={onPresetSubmit}
      // Now
      onNow={onNow}
      // Render
      cellRender={onInternalCellRender}
      // Styles
      classNames={mergedClassNames}
      styles={mergedStyles}
    />
  );

  // ========================================================
  // ==                      Selector                      ==
  // ========================================================

  // ======================== Change ========================
  const onSelectorChange = (date: DateType, index: number) => {
    triggerRangeValueChange(index, 'input', date);
  };

  const onSelectorInputChange = () => {
    triggerRangeValueChange(activeIndex, 'input');
  };

  // ======================= Selector =======================
  const onSelectorFocus: SelectorProps['onFocus'] = (event, index) => {
    triggerRangeValueChange(index, 'field-switch');

    triggerOpen(true, {
      inherit: true,
    });

    onFieldFocus(index, 'input', event);
  };

  const onSelectorBlur: SelectorProps['onBlur'] = (event, index) => {
    onFieldBlur(index, 'input', event);
  };

  const onSelectorKeyDown: SelectorProps['onKeyDown'] = (event, preventDefault) => {
    if (event.key === 'Tab') {
      triggerPartConfirm(null, 'keyboard-submit');
    } else if (event.key === 'Escape') {
      triggerRangeValueChange(activeIndex, 'esc');
      triggerOpen(false);
    }

    onKeyDown?.(event, preventDefault);
  };

  // ======================= Context ========================
  const context = React.useMemo(
    () => ({
      prefixCls,
      locale,
      generateConfig,
      button: components.button,
      input: components.input,
      classNames: mergedClassNames,
      styles: mergedStyles,
    }),
    [
      prefixCls,
      locale,
      generateConfig,
      components.button,
      components.input,
      mergedClassNames,
      mergedStyles,
    ],
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
        {...pickTriggerProps(filledProps)}
        popupElement={panel}
        popupStyle={mergedStyles.popup.root}
        popupClassName={clsx(rootClassName, mergedClassNames.popup.root)}
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
          // Style
          className={clsx(filledProps.className, rootClassName, mergedClassNames.root)}
          style={{ ...mergedStyles.root, ...filledProps.style }}
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
          onSubmit={() => triggerPartConfirm(null, 'keyboard-submit')}
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
          open={mergedOpen}
          onOpenChange={triggerOpen}
          // Click
          onClick={onSelectorClick}
          onClear={onSelectorClear}
          // Invalid
          invalid={submitInvalidates}
          onInvalid={onSelectorInvalid}
          // Offset
          onActiveInfo={setActiveInfo}
        />
      </PickerTrigger>
    </PickerContext.Provider>
  );
}

const RefRangePicker = React.forwardRef(RangePicker) as <DateType extends object = any>(
  props: RangePickerProps<DateType> & React.RefAttributes<RangePickerRef>,
) => React.ReactElement;

if (process.env.NODE_ENV !== 'production') {
  (RefRangePicker as any).displayName = 'RefRangePicker';
}

export default RefRangePicker;

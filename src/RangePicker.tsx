import classNames from 'classnames';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import raf from 'rc-util/lib/raf';
import warning from 'rc-util/lib/warning';
import pickAttrs from 'rc-util/lib/pickAttrs';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { PickerPanelProps } from '.';
import type { GenerateConfig } from './generate';
import { useCellRender } from './hooks/useCellRender';
import useHoverValue from './hooks/useHoverValue';
import usePickerInput from './hooks/usePickerInput';
import usePresets from './hooks/usePresets';
import useRangeDisabled from './hooks/useRangeDisabled';
import useRangeOpen from './hooks/useRangeOpen';
import useRangeViewDates from './hooks/useRangeViewDates';
import useTextValueMapping from './hooks/useTextValueMapping';
import useValueTexts from './hooks/useValueTexts';
import type {
  CellRender,
  CellRenderInfo,
  DisabledTimes,
  EventValue,
  PanelMode,
  PickerMode,
  PresetDate,
  RangeValue,
} from './interface';
import type { ContextOperationRefProps } from './PanelContext';
import PanelContext from './PanelContext';
import type { SharedTimeProps } from './panels/TimePanel';
import type { PickerBaseProps, PickerDateProps, PickerRefConfig, PickerTimeProps } from './Picker';
import PickerPanel from './PickerPanel';
import PickerTrigger from './PickerTrigger';
import PresetPanel from './PresetPanel';
import RangeContext from './RangeContext';
import {
  formatValue,
  getClosingViewDate,
  isEqual,
  isSameDate,
  isSameQuarter,
  isSameWeek,
  parseValue,
} from './utils/dateUtil';
import getExtraFooter from './utils/getExtraFooter';
import getRanges from './utils/getRanges';
import { getValue, toArray, updateValues } from './utils/miscUtil';
import { elementsContains, getDefaultFormat, getInputSize } from './utils/uiUtil';
import { legacyPropsWarning } from './utils/warnUtil';

function reorderValues<DateType>(
  values: RangeValue<DateType>,
  generateConfig: GenerateConfig<DateType>,
): RangeValue<DateType> {
  if (values && values[0] && values[1] && generateConfig.isAfter(values[0], values[1])) {
    return [values[1], values[0]];
  }

  return values;
}

function canValueTrigger<DateType>(
  value: EventValue<DateType>,
  index: number,
  disabled: [boolean, boolean],
  allowEmpty?: [boolean, boolean] | null,
): boolean {
  if (value) {
    return true;
  }

  if (allowEmpty && allowEmpty[index]) {
    return true;
  }

  if (disabled[(index + 1) % 2]) {
    return true;
  }

  return false;
}

export type RangeType = 'start' | 'end';

export type RangeInfo = {
  range: RangeType;
};

export type RangeDateRender<DateType> = (
  currentDate: DateType,
  today: DateType,
  info: RangeInfo,
) => React.ReactNode;

export type RangePickerSharedProps<DateType> = {
  id?: string;
  value?: RangeValue<DateType>;
  defaultValue?: RangeValue<DateType>;
  defaultPickerValue?: [DateType, DateType];
  placeholder?: [string, string];
  disabled?: boolean | [boolean, boolean];
  disabledTime?: (date: EventValue<DateType>, type: RangeType) => DisabledTimes;
  presets?: PresetDate<Exclude<RangeValue<DateType>, null>>[];
  /** @deprecated Please use `presets` instead */
  ranges?: Record<
    string,
    Exclude<RangeValue<DateType>, null> | (() => Exclude<RangeValue<DateType>, null>)
  >;
  separator?: React.ReactNode;
  allowEmpty?: [boolean, boolean];
  mode?: [PanelMode, PanelMode];
  onChange?: (values: RangeValue<DateType>, formatString: [string, string]) => void;
  onCalendarChange?: (
    values: RangeValue<DateType>,
    formatString: [string, string],
    info: RangeInfo,
  ) => void;
  onPanelChange?: (values: RangeValue<DateType>, modes: [PanelMode, PanelMode]) => void;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onOk?: (dates: RangeValue<DateType>) => void;
  direction?: 'ltr' | 'rtl';
  autoComplete?: string;
  /** @private Internal control of active picker. Do not use since it's private usage */
  activePickerIndex?: 0 | 1;
  /** @deprecated use cellRender instead of dateRender */
  dateRender?: RangeDateRender<DateType>;
  cellRender?: CellRender<DateType>;
  panelRender?: (originPanel: React.ReactNode) => React.ReactNode;
  /**
   * Trigger `onChange` event when blur.
   * If you don't want to user click `confirm` to trigger change, can use this.
   */
  changeOnBlur?: boolean;
};

type OmitPickerProps<Props> = Omit<
  Props,
  | 'value'
  | 'defaultValue'
  | 'defaultPickerValue'
  | 'placeholder'
  | 'disabled'
  | 'disabledTime'
  | 'showToday'
  | 'showTime'
  | 'mode'
  | 'onChange'
  | 'onSelect'
  | 'onPanelChange'
  | 'pickerValue'
  | 'onPickerValueChange'
  | 'onOk'
  | 'cellRender'
  | 'presets'
>;

type RangeShowTimeObject<DateType> = Omit<SharedTimeProps<DateType>, 'defaultValue'> & {
  defaultValue?: DateType[];
};

export type RangePickerBaseProps<DateType> = {} & RangePickerSharedProps<DateType> &
  OmitPickerProps<PickerBaseProps<DateType>>;

export type RangePickerDateProps<DateType> = {
  showTime?: boolean | RangeShowTimeObject<DateType>;
} & RangePickerSharedProps<DateType> &
  OmitPickerProps<PickerDateProps<DateType>>;

export type RangePickerTimeProps<DateType> = {
  order?: boolean;
} & RangePickerSharedProps<DateType> &
  OmitPickerProps<PickerTimeProps<DateType>>;

export type RangePickerProps<DateType> =
  | RangePickerBaseProps<DateType>
  | RangePickerDateProps<DateType>
  | RangePickerTimeProps<DateType>;

// TMP type to fit for ts 3.9.2
type OmitType<DateType> = Omit<RangePickerBaseProps<DateType>, 'picker' | 'presets'> &
  Omit<RangePickerDateProps<DateType>, 'picker'> &
  Omit<RangePickerTimeProps<DateType>, 'picker'>;

type MergedRangePickerProps<DateType> = {
  picker?: PickerMode;
} & OmitType<DateType>;

function InnerRangePicker<DateType>(props: RangePickerProps<DateType>) {
  const {
    prefixCls = 'rc-picker',
    id,
    style,
    className,
    popupStyle,
    dropdownClassName,
    transitionName,
    dropdownAlign,
    getPopupContainer,
    generateConfig,
    locale,
    placeholder,
    autoFocus,
    disabled,
    format,
    picker = 'date',
    showTime,
    use12Hours,
    separator = '~',
    value,
    defaultValue,
    defaultPickerValue,
    open,
    defaultOpen,
    disabledDate,
    disabledTime,
    dateRender,
    monthCellRender,
    cellRender,
    panelRender,
    presets,
    ranges,
    allowEmpty,
    allowClear,
    suffixIcon,
    clearIcon,
    pickerRef,
    inputReadOnly,
    mode,
    renderExtraFooter,
    onChange,
    onOpenChange,
    onPanelChange,
    onCalendarChange,
    onFocus,
    onBlur,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    onClick,
    onOk,
    onKeyDown,
    components,
    order,
    direction,
    activePickerIndex,
    autoComplete = 'off',
    changeOnBlur,
  } = props as MergedRangePickerProps<DateType>;

  const needConfirmButton: boolean = (picker === 'date' && !!showTime) || picker === 'time';

  const containerRef = useRef<HTMLDivElement>(null);
  const panelDivRef = useRef<HTMLDivElement>(null);
  const startInputDivRef = useRef<HTMLDivElement>(null);
  const endInputDivRef = useRef<HTMLDivElement>(null);
  const separatorRef = useRef<HTMLDivElement>(null);
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  // ============================ Warning ============================
  if (process.env.NODE_ENV !== 'production') {
    legacyPropsWarning(props);
  }

  // ============================= Misc ==============================
  const formatList = toArray(getDefaultFormat<DateType>(format, picker, showTime, use12Hours));

  // Operation ref
  const operationRef: React.MutableRefObject<ContextOperationRefProps | null> =
    useRef<ContextOperationRefProps>(null);

  const mergedDisabled = React.useMemo<[boolean, boolean]>(() => {
    if (Array.isArray(disabled)) {
      return disabled;
    }

    return [disabled || false, disabled || false];
  }, [disabled]);

  // ============================= Value =============================
  const [mergedValue, setInnerValue] = useMergedState<RangeValue<DateType>>(null, {
    value,
    defaultValue,
    postState: (values) =>
      picker === 'time' && !order ? values : reorderValues(values, generateConfig),
  });

  // =========================== View Date ===========================
  // Config view panel
  const [getViewDate, setViewDate] = useRangeViewDates({
    values: mergedValue,
    picker,
    defaultDates: defaultPickerValue,
    generateConfig,
  });

  // ========================= Select Values =========================
  const [selectedValue, setSelectedValue] = useMergedState(mergedValue, {
    postState: (values) => {
      let postValues = values;

      if (mergedDisabled[0] && mergedDisabled[1]) {
        return postValues;
      }

      // Fill disabled unit
      for (let i = 0; i < 2; i += 1) {
        if (
          mergedDisabled[i] &&
          !postValues &&
          !getValue(postValues, i) &&
          !getValue(allowEmpty, i)
        ) {
          postValues = updateValues(postValues, generateConfig.getNow(), i);
        }
      }
      return postValues;
    },
  });

  // ============================= Modes =============================
  const [mergedModes, setInnerModes] = useMergedState<[PanelMode, PanelMode]>([picker, picker], {
    value: mode,
  });

  useEffect(() => {
    setInnerModes([picker, picker]);
  }, [picker]);

  const triggerModesChange = (modes: [PanelMode, PanelMode], values: RangeValue<DateType>) => {
    setInnerModes(modes);

    if (onPanelChange) {
      onPanelChange(values, modes);
    }
  };

  // ============================= Open ==============================
  const [mergedOpen, mergedActivePickerIndex, firstTimeOpen, triggerOpen] = useRangeOpen(
    defaultOpen,
    open,
    activePickerIndex,
    changeOnBlur,
    startInputRef,
    endInputRef,
    getValue(selectedValue, 0),
    getValue(selectedValue, 1),
    mergedDisabled,
    onOpenChange,
  );

  const startOpen = mergedOpen && mergedActivePickerIndex === 0;
  const endOpen = mergedOpen && mergedActivePickerIndex === 1;

  // ========================= Disable Date ==========================
  const [disabledStartDate, disabledEndDate] = useRangeDisabled(
    {
      picker,
      selectedValue,
      locale,
      disabled: mergedDisabled,
      disabledDate,
      generateConfig,
    },
    !mergedOpen || firstTimeOpen,
  );

  // ============================= Popup =============================
  // Popup min width
  const [popupMinWidth, setPopupMinWidth] = useState(0);
  useEffect(() => {
    if (!mergedOpen && containerRef.current) {
      setPopupMinWidth(containerRef.current.offsetWidth);
    }
  }, [mergedOpen]);

  // ============================ Trigger ============================
  function triggerOpenAndFocus(index: 0 | 1) {
    triggerOpen(true, index, 'open');
    // Use setTimeout to make sure panel DOM exists
    raf(() => {
      const inputRef = [startInputRef, endInputRef][index];
      inputRef.current?.focus();
    }, 0);
  }

  function triggerChange(newValue: RangeValue<DateType>, sourceIndex: 0 | 1) {
    let values = newValue;
    let startValue = getValue(values, 0);
    let endValue = getValue(values, 1);

    // >>>>> Format start & end values
    if (startValue && endValue && generateConfig.isAfter(startValue, endValue)) {
      if (
        // WeekPicker only compare week
        (picker === 'week' && !isSameWeek(generateConfig, locale.locale, startValue, endValue)) ||
        // QuotaPicker only compare week
        (picker === 'quarter' && !isSameQuarter(generateConfig, startValue, endValue)) ||
        // Other non-TimePicker compare date
        (picker !== 'week' &&
          picker !== 'quarter' &&
          picker !== 'time' &&
          !isSameDate(generateConfig, startValue, endValue))
      ) {
        // Clean up end date when start date is after end date
        if (sourceIndex === 0) {
          values = [startValue, null];
          endValue = null;
        } else {
          startValue = null;
          values = [null, endValue];
        }
      } else if (picker !== 'time' || order !== false) {
        // Reorder when in same date
        values = reorderValues(values, generateConfig);
      }
    }

    setSelectedValue(values);

    const startStr =
      values && values[0]
        ? formatValue(values[0], { generateConfig, locale, format: formatList[0] })
        : '';
    const endStr =
      values && values[1]
        ? formatValue(values[1], { generateConfig, locale, format: formatList[0] })
        : '';

    if (onCalendarChange) {
      const info: RangeInfo = { range: sourceIndex === 0 ? 'start' : 'end' };

      onCalendarChange(values, [startStr, endStr], info);
    }

    // >>>>> Trigger `onChange` event
    const canStartValueTrigger = canValueTrigger(startValue, 0, mergedDisabled, allowEmpty);
    const canEndValueTrigger = canValueTrigger(endValue, 1, mergedDisabled, allowEmpty);

    const canTrigger = values === null || (canStartValueTrigger && canEndValueTrigger);

    if (canTrigger) {
      // Trigger onChange only when value is validate
      setInnerValue(values);

      if (
        onChange &&
        (!isEqual(generateConfig, getValue(mergedValue, 0), startValue) ||
          !isEqual(generateConfig, getValue(mergedValue, 1), endValue))
      ) {
        onChange(values, [startStr, endStr]);
      }
    }
  }

  const forwardKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (mergedOpen && operationRef.current && operationRef.current.onKeyDown) {
      // Let popup panel handle keyboard
      return operationRef.current.onKeyDown(e);
    }

    /* istanbul ignore next */
    /* eslint-disable no-lone-blocks */
    {
      warning(
        false,
        'Picker not correct forward KeyDown operation. Please help to fire issue about this.',
      );
      return false;
    }
  };

  // ============================= Text ==============================
  const sharedTextHooksProps = {
    formatList,
    generateConfig,
    locale,
  };

  const [startValueTexts, firstStartValueText] = useValueTexts<DateType>(
    getValue(selectedValue, 0),
    sharedTextHooksProps,
  );

  const [endValueTexts, firstEndValueText] = useValueTexts<DateType>(
    getValue(selectedValue, 1),
    sharedTextHooksProps,
  );

  const onTextChange = (newText: string, index: 0 | 1) => {
    const inputDate = parseValue(newText, {
      locale,
      formatList,
      generateConfig,
    });

    const disabledFunc = index === 0 ? disabledStartDate : disabledEndDate;

    if (inputDate && !disabledFunc(inputDate)) {
      setSelectedValue(updateValues(selectedValue, inputDate, index));
      setViewDate(inputDate, index);
    }
  };

  const [startText, triggerStartTextChange, resetStartText] = useTextValueMapping({
    valueTexts: startValueTexts,
    onTextChange: (newText) => onTextChange(newText, 0),
  });

  const [endText, triggerEndTextChange, resetEndText] = useTextValueMapping({
    valueTexts: endValueTexts,
    onTextChange: (newText) => onTextChange(newText, 1),
  });

  const [rangeHoverValue, setRangeHoverValue] = useState<RangeValue<DateType>>(null);

  // ========================== Hover Range ==========================
  const [hoverRangedValue, setHoverRangedValue] = useState<RangeValue<DateType>>(null);

  const [startHoverValue, onStartEnter, onStartLeave] = useHoverValue(startText, {
    formatList,
    generateConfig,
    locale,
  });

  const [endHoverValue, onEndEnter, onEndLeave] = useHoverValue(endText, {
    formatList,
    generateConfig,
    locale,
  });

  const onDateMouseEnter = (date: DateType) => {
    setHoverRangedValue(updateValues(selectedValue, date, mergedActivePickerIndex));
    if (mergedActivePickerIndex === 0) {
      onStartEnter(date);
    } else {
      onEndEnter(date);
    }
  };

  const onDateMouseLeave = () => {
    setHoverRangedValue(updateValues(selectedValue, null, mergedActivePickerIndex));
    if (mergedActivePickerIndex === 0) {
      onStartLeave();
    } else {
      onEndLeave();
    }
  };

  // ============================= Input =============================
  // We call effect to update `delayOpen` here since
  // when popup closed and input focused, should not trigger change when click another input
  const [delayOpen, setDelayOpen] = React.useState(mergedOpen);
  React.useEffect(() => {
    setDelayOpen(mergedOpen);
  }, [mergedOpen]);

  const onInternalBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    if (changeOnBlur && delayOpen) {
      const selectedIndexValue = getValue(selectedValue, mergedActivePickerIndex);
      if (selectedIndexValue) {
        triggerChange(selectedValue, mergedActivePickerIndex);
      }
    }
    return onBlur?.(e);
  };

  const getSharedInputHookProps = (index: 0 | 1, resetText: () => void) => ({
    blurToCancel: !changeOnBlur && needConfirmButton,
    forwardKeyDown,
    onBlur: onInternalBlur,
    isClickOutside: (target: EventTarget | null) =>
      !elementsContains(
        [
          panelDivRef.current,
          startInputDivRef.current,
          endInputDivRef.current,
          containerRef.current,
        ],
        target as HTMLElement,
      ),
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      if (onFocus) {
        onFocus(e);
      }
    },
    triggerOpen: (newOpen: boolean) => {
      if (newOpen) {
        triggerOpen(newOpen, index, 'open');
      } else {
        triggerOpen(
          newOpen,
          // Close directly if no selected value provided
          getValue(selectedValue, index) ? index : false,
          'blur',
        );
      }
    },
    onSubmit: () => {
      if (
        // When user typing disabledDate with keyboard and enter, this value will be empty
        !selectedValue ||
        // Normal disabled check
        (disabledDate && disabledDate(selectedValue[index]))
      ) {
        return false;
      }

      triggerChange(selectedValue, index);
      resetText();

      // Switch
      triggerOpen(false, mergedActivePickerIndex, 'confirm');
    },
    onCancel: () => {
      triggerOpen(false, index, 'cancel');
      setSelectedValue(mergedValue);
      resetText();
    },
  });

  const sharedPickerInput = {
    onKeyDown: (e, preventDefault) => {
      onKeyDown?.(e, preventDefault);
    },
    changeOnBlur,
  };

  const [startInputProps, { focused: startFocused, typing: startTyping }] = usePickerInput({
    ...getSharedInputHookProps(0, resetStartText),
    open: startOpen,
    value: startText,
    ...sharedPickerInput,
  });

  const [endInputProps, { focused: endFocused, typing: endTyping }] = usePickerInput({
    ...getSharedInputHookProps(1, resetEndText),
    open: endOpen,
    value: endText,
    ...sharedPickerInput,
  });

  // ========================== Click Picker ==========================
  const onPickerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // When click inside the picker & outside the picker's input elements
    // the panel should still be opened
    if (onClick) {
      onClick(e);
    }
    if (
      !mergedOpen &&
      !startInputRef.current.contains(e.target as Node) &&
      !endInputRef.current.contains(e.target as Node)
    ) {
      if (!mergedDisabled[0]) {
        triggerOpenAndFocus(0);
      } else if (!mergedDisabled[1]) {
        triggerOpenAndFocus(1);
      }
    }
  };

  const onPickerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // shouldn't affect input elements if picker is active
    if (onMouseDown) {
      onMouseDown(e);
    }
    if (
      mergedOpen &&
      (startFocused || endFocused) &&
      !startInputRef.current.contains(e.target as Node) &&
      !endInputRef.current.contains(e.target as Node)
    ) {
      e.preventDefault();
    }
  };

  // ============================= Sync ==============================
  // Close should sync back with text value
  const startStr =
    mergedValue && mergedValue[0]
      ? formatValue(mergedValue[0], {
          locale,
          format: 'YYYYMMDDHHmmss',
          generateConfig,
        })
      : '';
  const endStr =
    mergedValue && mergedValue[1]
      ? formatValue(mergedValue[1], {
          locale,
          format: 'YYYYMMDDHHmmss',
          generateConfig,
        })
      : '';

  useEffect(() => {
    if (!mergedOpen) {
      setSelectedValue(mergedValue);

      if (!startValueTexts.length || startValueTexts[0] === '') {
        triggerStartTextChange('');
      } else if (firstStartValueText !== startText) {
        resetStartText();
      }
      if (!endValueTexts.length || endValueTexts[0] === '') {
        triggerEndTextChange('');
      } else if (firstEndValueText !== endText) {
        resetEndText();
      }
    }
  }, [mergedOpen, startValueTexts, endValueTexts]);

  // Sync innerValue with control mode
  useEffect(() => {
    setSelectedValue(mergedValue);
  }, [startStr, endStr]);

  const mergedCellRender: CellRender<DateType> = useCellRender({
    cellRender,
    monthCellRender,
    dateRender,
  });

  const panelDateRender = React.useMemo(() => {
    if (!mergedCellRender) return undefined;
    return (date: DateType, info: CellRenderInfo<DateType>) =>
      mergedCellRender(date, { ...info, range: mergedActivePickerIndex ? 'end' : 'start' });
  }, [mergedActivePickerIndex, mergedCellRender]);

  // ============================ Warning ============================
  if (process.env.NODE_ENV !== 'production') {
    if (
      value &&
      Array.isArray(disabled) &&
      ((getValue(disabled, 0) && !getValue(value, 0)) ||
        (getValue(disabled, 1) && !getValue(value, 1)))
    ) {
      warning(
        false,
        '`disabled` should not set with empty `value`. You should set `allowEmpty` or `value` instead.',
      );
    }
    warning(!dateRender, `'dateRender' is deprecated. Please use 'cellRender' instead.`);
    warning(!monthCellRender, `'monthCellRender' is deprecated. Please use 'cellRender' instead.`);
  }

  // ============================ Private ============================
  if (pickerRef) {
    pickerRef.current = {
      focus: () => {
        if (startInputRef.current) {
          startInputRef.current.focus();
        }
      },
      blur: () => {
        if (startInputRef.current) {
          startInputRef.current.blur();
        }
        if (endInputRef.current) {
          endInputRef.current.blur();
        }
      },
    };
  }

  // ============================ Ranges =============================
  const presetList = usePresets(presets, ranges);

  // ============================= Panel =============================
  function renderPanel(
    panelPosition: 'left' | 'right' | false = false,
    panelProps: Partial<PickerPanelProps<DateType>> = {},
  ) {
    let panelHoverRangedValue: RangeValue<DateType> = null;
    if (
      mergedOpen &&
      hoverRangedValue &&
      hoverRangedValue[0] &&
      hoverRangedValue[1] &&
      generateConfig.isAfter(hoverRangedValue[1], hoverRangedValue[0])
    ) {
      panelHoverRangedValue = hoverRangedValue;
    }

    let panelShowTime: boolean | SharedTimeProps<DateType> | undefined =
      showTime as SharedTimeProps<DateType>;
    if (showTime && typeof showTime === 'object' && showTime.defaultValue) {
      const timeDefaultValues: DateType[] = showTime.defaultValue!;
      panelShowTime = {
        ...showTime,
        defaultValue: getValue(timeDefaultValues, mergedActivePickerIndex) || undefined,
      };
    }

    return (
      <RangeContext.Provider
        value={{
          inRange: true,
          panelPosition,
          rangedValue: rangeHoverValue || selectedValue,
          hoverRangedValue: panelHoverRangedValue,
        }}
      >
        <PickerPanel<DateType>
          {...(props as any)}
          {...panelProps}
          cellRender={panelDateRender}
          showTime={panelShowTime}
          mode={mergedModes[mergedActivePickerIndex]}
          generateConfig={generateConfig}
          style={undefined}
          direction={direction}
          disabledDate={mergedActivePickerIndex === 0 ? disabledStartDate : disabledEndDate}
          disabledTime={(date) => {
            if (disabledTime) {
              return disabledTime(date, mergedActivePickerIndex === 0 ? 'start' : 'end');
            }
            return false;
          }}
          className={classNames({
            [`${prefixCls}-panel-focused`]:
              mergedActivePickerIndex === 0 ? !startTyping : !endTyping,
          })}
          value={getValue(selectedValue, mergedActivePickerIndex)}
          locale={locale}
          tabIndex={-1}
          onPanelChange={(date, newMode) => {
            // clear hover value when panel change
            if (mergedActivePickerIndex === 0) {
              onStartLeave(true);
            }
            if (mergedActivePickerIndex === 1) {
              onEndLeave(true);
            }
            triggerModesChange(
              updateValues(mergedModes, newMode, mergedActivePickerIndex),
              updateValues(selectedValue, date, mergedActivePickerIndex),
            );

            let viewDate = date;
            if (panelPosition === 'right' && mergedModes[mergedActivePickerIndex] === newMode) {
              viewDate = getClosingViewDate(viewDate, newMode as any, generateConfig, -1);
            }
            setViewDate(viewDate, mergedActivePickerIndex);
          }}
          onOk={null}
          onSelect={undefined}
          onChange={undefined}
          defaultValue={
            mergedActivePickerIndex === 0 ? getValue(selectedValue, 1) : getValue(selectedValue, 0)
          }
          // defaultPickerValue={undefined}
        />
      </RangeContext.Provider>
    );
  }

  let arrowLeft: number = 0;
  let panelLeft: number = 0;
  if (
    mergedActivePickerIndex &&
    startInputDivRef.current &&
    separatorRef.current &&
    panelDivRef.current &&
    arrowRef.current
  ) {
    // Arrow offset
    arrowLeft = startInputDivRef.current.offsetWidth + separatorRef.current.offsetWidth;

    // If panelWidth - arrowWidth - arrowMarginLeft < arrowLeft, panel should move to right side.
    // If arrowOffsetLeft > arrowLeft, arrowMarginLeft = arrowOffsetLeft - arrowLeft
    const arrowMarginLeft =
      arrowRef.current.offsetLeft > arrowLeft
        ? arrowRef.current.offsetLeft - arrowLeft
        : arrowRef.current.offsetLeft;

    const panelWidth = panelDivRef.current.offsetWidth;
    const arrowWidth = arrowRef.current.offsetWidth;

    if (
      panelWidth &&
      arrowWidth &&
      arrowLeft > panelWidth - arrowWidth - (direction === 'rtl' ? 0 : arrowMarginLeft)
    ) {
      panelLeft = arrowLeft;
    }
  }

  const arrowPositionStyle = direction === 'rtl' ? { right: arrowLeft } : { left: arrowLeft };

  function renderPanels() {
    let panels: React.ReactNode;
    const extraNode = getExtraFooter(
      prefixCls,
      mergedModes[mergedActivePickerIndex],
      renderExtraFooter,
    );

    const rangesNode = getRanges({
      prefixCls,
      components,
      needConfirmButton,
      okDisabled:
        !getValue(selectedValue, mergedActivePickerIndex) ||
        (disabledDate && disabledDate(selectedValue[mergedActivePickerIndex])),
      locale,
      // rangeList,
      onOk: () => {
        const selectedIndexValue = getValue(selectedValue, mergedActivePickerIndex);
        if (selectedIndexValue) {
          triggerChange(selectedValue, mergedActivePickerIndex);
          onOk?.(selectedValue);

          // Switch
          triggerOpen(false, mergedActivePickerIndex, 'confirm');
        }
      },
    });

    if (picker !== 'time' && !showTime) {
      const viewDate = getViewDate(mergedActivePickerIndex);
      const nextViewDate = getClosingViewDate(viewDate, picker, generateConfig);
      const currentMode = mergedModes[mergedActivePickerIndex];

      const showDoublePanel = currentMode === picker;
      const leftPanel = renderPanel(showDoublePanel ? 'left' : false, {
        pickerValue: viewDate,
        onPickerValueChange: (newViewDate) => {
          setViewDate(newViewDate, mergedActivePickerIndex);
        },
      });
      const rightPanel = renderPanel('right', {
        pickerValue: nextViewDate,
        onPickerValueChange: (newViewDate) => {
          setViewDate(
            getClosingViewDate(newViewDate, picker, generateConfig, -1),
            mergedActivePickerIndex,
          );
        },
      });

      if (direction === 'rtl') {
        panels = (
          <>
            {rightPanel}
            {showDoublePanel && leftPanel}
          </>
        );
      } else {
        panels = (
          <>
            {leftPanel}
            {showDoublePanel && rightPanel}
          </>
        );
      }
    } else {
      panels = renderPanel();
    }

    let mergedNodes: React.ReactNode = (
      <div className={`${prefixCls}-panel-layout`}>
        <PresetPanel
          prefixCls={prefixCls}
          presets={presetList}
          onClick={(nextValue) => {
            triggerChange(nextValue, null);
            triggerOpen(false, mergedActivePickerIndex, 'preset');
          }}
          onHover={(hoverValue) => {
            setRangeHoverValue(hoverValue);
          }}
        />
        <div>
          <div className={`${prefixCls}-panels`}>{panels}</div>
          {(extraNode || rangesNode) && (
            <div className={`${prefixCls}-footer`}>
              {extraNode}
              {rangesNode}
            </div>
          )}
        </div>
      </div>
    );

    if (panelRender) {
      mergedNodes = panelRender(mergedNodes);
    }

    return (
      <div
        className={`${prefixCls}-panel-container`}
        style={{ marginLeft: panelLeft }}
        ref={panelDivRef}
        onMouseDown={(e) => {
          e.preventDefault();
        }}
      >
        {mergedNodes}
      </div>
    );
  }

  const rangePanel = (
    <div
      className={classNames(`${prefixCls}-range-wrapper`, `${prefixCls}-${picker}-range-wrapper`)}
      style={{ minWidth: popupMinWidth }}
    >
      <div ref={arrowRef} className={`${prefixCls}-range-arrow`} style={arrowPositionStyle} />

      {renderPanels()}
    </div>
  );

  // ============================= Icons =============================
  let suffixNode: React.ReactNode;
  if (suffixIcon) {
    suffixNode = (
      <span
        className={`${prefixCls}-suffix`}
        onMouseDown={(e) => {
          // Not lost focus
          e.preventDefault();
        }}
      >
        {suffixIcon}
      </span>
    );
  }

  let clearNode: React.ReactNode;
  if (
    allowClear &&
    ((getValue(mergedValue, 0) && !mergedDisabled[0]) ||
      (getValue(mergedValue, 1) && !mergedDisabled[1]))
  ) {
    clearNode = (
      <span
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseUp={(e) => {
          e.preventDefault();
          e.stopPropagation();
          let values = mergedValue;

          if (!mergedDisabled[0]) {
            values = updateValues(values, null, 0);
          }
          if (!mergedDisabled[1]) {
            values = updateValues(values, null, 1);
          }

          triggerChange(values, null);
          triggerOpen(false, mergedActivePickerIndex, 'clear');
        }}
        className={`${prefixCls}-clear`}
      >
        {clearIcon || <span className={`${prefixCls}-clear-btn`} />}
      </span>
    );
  }

  const inputSharedProps = {
    size: getInputSize(picker, formatList[0], generateConfig),
  };

  let activeBarLeft: number = 0;
  let activeBarWidth: number = 0;
  if (startInputDivRef.current && endInputDivRef.current && separatorRef.current) {
    if (mergedActivePickerIndex === 0) {
      activeBarWidth = startInputDivRef.current.offsetWidth;
    } else {
      activeBarLeft = arrowLeft;
      activeBarWidth = endInputDivRef.current.offsetWidth;
    }
  }
  const activeBarPositionStyle =
    direction === 'rtl' ? { right: activeBarLeft } : { left: activeBarLeft };
  // ============================ Return =============================
  const onContextSelect = (date: DateType, type: 'key' | 'mouse' | 'submit') => {
    const values = updateValues(selectedValue, date, mergedActivePickerIndex);

    if (type === 'submit' || (type !== 'key' && !needConfirmButton)) {
      // triggerChange will also update selected values
      triggerChange(values, mergedActivePickerIndex);
      // clear hover value style
      if (mergedActivePickerIndex === 0) {
        onStartLeave();
      } else {
        onEndLeave();
      }

      // Switch
      const nextActivePickerIndex = mergedActivePickerIndex === 0 ? 1 : 0;
      if (mergedDisabled[nextActivePickerIndex]) {
        triggerOpen(false, false, 'confirm');
      } else {
        triggerOpen(false, mergedActivePickerIndex, 'confirm');
      }
    } else {
      setSelectedValue(values);
    }
  };

  return (
    <PanelContext.Provider
      value={{
        operationRef,
        hideHeader: picker === 'time',
        onDateMouseEnter,
        onDateMouseLeave,
        hideRanges: true,
        onSelect: onContextSelect,
        open: mergedOpen,
      }}
    >
      <PickerTrigger
        visible={mergedOpen}
        popupElement={rangePanel}
        popupStyle={popupStyle}
        prefixCls={prefixCls}
        dropdownClassName={dropdownClassName}
        dropdownAlign={dropdownAlign}
        getPopupContainer={getPopupContainer}
        transitionName={transitionName}
        range
        direction={direction}
      >
        <div
          ref={containerRef}
          className={classNames(prefixCls, `${prefixCls}-range`, className, {
            [`${prefixCls}-disabled`]: mergedDisabled[0] && mergedDisabled[1],
            [`${prefixCls}-focused`]: mergedActivePickerIndex === 0 ? startFocused : endFocused,
            [`${prefixCls}-rtl`]: direction === 'rtl',
          })}
          style={style}
          onClick={onPickerClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseDown={onPickerMouseDown}
          onMouseUp={onMouseUp}
          {...pickAttrs(props, { aria: true, data: true })}
        >
          <div
            className={classNames(`${prefixCls}-input`, {
              [`${prefixCls}-input-active`]: mergedActivePickerIndex === 0,
              [`${prefixCls}-input-placeholder`]: !!startHoverValue,
            })}
            ref={startInputDivRef}
          >
            <input
              id={id}
              disabled={mergedDisabled[0]}
              readOnly={inputReadOnly || typeof formatList[0] === 'function' || !startTyping}
              value={startHoverValue || startText}
              onChange={(e) => {
                triggerStartTextChange(e.target.value);
              }}
              autoFocus={autoFocus}
              placeholder={getValue(placeholder, 0) || ''}
              ref={startInputRef}
              {...startInputProps}
              {...inputSharedProps}
              autoComplete={autoComplete}
            />
          </div>
          <div className={`${prefixCls}-range-separator`} ref={separatorRef}>
            {separator}
          </div>
          <div
            className={classNames(`${prefixCls}-input`, {
              [`${prefixCls}-input-active`]: mergedActivePickerIndex === 1,
              [`${prefixCls}-input-placeholder`]: !!endHoverValue,
            })}
            ref={endInputDivRef}
          >
            <input
              disabled={mergedDisabled[1]}
              readOnly={inputReadOnly || typeof formatList[0] === 'function' || !endTyping}
              value={endHoverValue || endText}
              onChange={(e) => {
                triggerEndTextChange(e.target.value);
              }}
              placeholder={getValue(placeholder, 1) || ''}
              ref={endInputRef}
              {...endInputProps}
              {...inputSharedProps}
              autoComplete={autoComplete}
            />
          </div>
          <div
            className={`${prefixCls}-active-bar`}
            style={{
              ...activeBarPositionStyle,
              width: activeBarWidth,
              position: 'absolute',
            }}
          />
          {suffixNode}
          {clearNode}
        </div>
      </PickerTrigger>
    </PanelContext.Provider>
  );
}

// Wrap with class component to enable pass generic with instance method
class RangePicker<DateType> extends React.Component<RangePickerProps<DateType>> {
  pickerRef = React.createRef<PickerRefConfig>();

  focus = () => {
    if (this.pickerRef.current) {
      this.pickerRef.current.focus();
    }
  };

  blur = () => {
    if (this.pickerRef.current) {
      this.pickerRef.current.blur();
    }
  };

  render() {
    return (
      <InnerRangePicker<DateType>
        {...this.props}
        pickerRef={this.pickerRef as React.MutableRefObject<PickerRefConfig>}
      />
    );
  }
}

export default RangePicker;

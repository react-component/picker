import * as React from 'react';
import classNames from 'classnames';
import warning from 'rc-util/lib/warning';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import {
  DisabledTimes,
  PanelMode,
  PickerMode,
  RangeValue,
  EventValue,
} from './interface';
import {
  PickerBaseProps,
  PickerDateProps,
  PickerTimeProps,
  PickerRefConfig,
} from './Picker';
import { SharedTimeProps } from './panels/TimePanel';
import PickerTrigger from './PickerTrigger';
import PickerPanel from './PickerPanel';
import usePickerInput from './hooks/usePickerInput';
import getDataOrAriaProps, {
  toArray,
  getValue,
  updateValues,
} from './utils/miscUtil';
import {
  getDefaultFormat,
  getInputSize,
  elementsContains,
} from './utils/uiUtil';
import PanelContext, { ContextOperationRefProps } from './PanelContext';
import { isEqual, getClosingViewDate, isSameDate } from './utils/dateUtil';
import useValueTexts from './hooks/useValueTexts';
import useTextValueMapping from './hooks/useTextValueMapping';
import { GenerateConfig } from './generate';
import { PickerPanelProps } from '.';
import RangeContext from './RangeContext';
import useRangeDisabled from './hooks/useRangeDisabled';
import getExtraFooter from './utils/getExtraFooter';
import getRanges from './utils/getRanges';
import useRangeViewDates from './hooks/useRangeViewDates';

function reorderValues<DateType>(
  values: RangeValue<DateType>,
  generateConfig: GenerateConfig<DateType>,
): RangeValue<DateType> {
  if (
    values &&
    values[0] &&
    values[1] &&
    generateConfig.isAfter(values[0], values[1])
  ) {
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

export interface RangePickerSharedProps<DateType> {
  value?: RangeValue<DateType>;
  defaultValue?: RangeValue<DateType>;
  defaultPickerValue?: [DateType, DateType];
  placeholder?: [string, string];
  disabled?: boolean | [boolean, boolean];
  disabledTime?: (
    date: EventValue<DateType>,
    type: 'start' | 'end',
  ) => DisabledTimes;
  ranges?: Record<
    string,
    | Exclude<RangeValue<DateType>, null>
    | (() => Exclude<RangeValue<DateType>, null>)
  >;
  separator?: React.ReactNode;
  allowEmpty?: [boolean, boolean];
  mode?: [PanelMode, PanelMode];
  onChange?: (
    values: RangeValue<DateType>,
    formatString: [string, string],
  ) => void;
  onCalendarChange?: (
    values: RangeValue<DateType>,
    formatString: [string, string],
  ) => void;
  onPanelChange?: (
    values: RangeValue<DateType>,
    modes: [PanelMode, PanelMode],
  ) => void;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onOk?: (dates: RangeValue<DateType>) => void;
  direction?: 'ltr' | 'rtl';
}

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
>;

type RangeShowTimeObject<DateType> = Omit<
  SharedTimeProps<DateType>,
  'defaultValue'
> & {
  defaultValue?: DateType[];
};

export interface RangePickerBaseProps<DateType>
  extends RangePickerSharedProps<DateType>,
    OmitPickerProps<PickerBaseProps<DateType>> {}

export interface RangePickerDateProps<DateType>
  extends RangePickerSharedProps<DateType>,
    OmitPickerProps<PickerDateProps<DateType>> {
  showTime?: boolean | RangeShowTimeObject<DateType>;
}

export interface RangePickerTimeProps<DateType>
  extends RangePickerSharedProps<DateType>,
    OmitPickerProps<PickerTimeProps<DateType>> {}

export type RangePickerProps<DateType> =
  | RangePickerBaseProps<DateType>
  | RangePickerDateProps<DateType>
  | RangePickerTimeProps<DateType>;

interface MergedRangePickerProps<DateType>
  extends Omit<
    RangePickerBaseProps<DateType> &
      RangePickerDateProps<DateType> &
      RangePickerTimeProps<DateType>,
    'picker'
  > {
  picker?: PickerMode;
}

function InnerRangePicker<DateType>(props: RangePickerProps<DateType>) {
  const {
    prefixCls = 'rc-picker',
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
    onOk,
    components,
    direction,
  } = props as MergedRangePickerProps<DateType>;

  const needConfirmButton: boolean =
    (picker === 'date' && !!showTime) || picker === 'time';

  const containerRef = React.useRef<HTMLDivElement>(null);
  const panelDivRef = React.useRef<HTMLDivElement>(null);
  const startInputDivRef = React.useRef<HTMLDivElement>(null);
  const endInputDivRef = React.useRef<HTMLDivElement>(null);
  const separatorRef = React.useRef<HTMLDivElement>(null);
  const startInputRef = React.useRef<HTMLInputElement>(null);
  const endInputRef = React.useRef<HTMLInputElement>(null);

  // ============================= Misc ==============================
  const formatList = toArray(
    getDefaultFormat(format, picker, showTime, use12Hours),
  );

  // Active picker
  const [activePickerIndex, setActivePickerIndex] = React.useState<0 | 1>(0);

  // Operation ref
  const operationRef: React.MutableRefObject<ContextOperationRefProps | null> = React.useRef<
    ContextOperationRefProps
  >(null);

  const mergedDisabled = React.useMemo<[boolean, boolean]>(() => {
    if (Array.isArray(disabled)) {
      return disabled;
    }

    return [disabled || false, disabled || false];
  }, [disabled]);

  // ============================= Value =============================
  const [mergedValue, setInnerValue] = useMergedState<RangeValue<DateType>>(
    null,
    {
      value,
      defaultValue,
      postState: values => reorderValues(values, generateConfig),
    },
  );

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
    postState: values => {
      let postValues = values;
      for (let i = 0; i < 2; i += 1) {
        if (
          mergedDisabled[i] &&
          !getValue(postValues, i) &&
          !getValue(allowEmpty, i)
        ) {
          postValues = updateValues(postValues, generateConfig.getNow(), i);
        }
      }
      return postValues;
    },
  });

  const [rangeHoverValue, setRangeHoverValue] = React.useState<
    RangeValue<DateType>
  >(null);

  // ========================== Hover Range ==========================
  const [hoverRangedValue, setHoverRangedValue] = React.useState<
    RangeValue<DateType>
  >(null);

  const onDateMouseEnter = (date: DateType) => {
    setHoverRangedValue(updateValues(selectedValue, date, activePickerIndex));
  };
  const onDateMouseLeave = () => {
    setHoverRangedValue(updateValues(selectedValue, null, activePickerIndex));
  };

  // ============================= Modes =============================
  const [mergedModes, setInnerModes] = useMergedState<[PanelMode, PanelMode]>(
    [picker, picker],
    {
      value: mode,
    },
  );

  React.useEffect(() => {
    setInnerModes([picker, picker]);
  }, [picker]);

  const triggerModesChange = (
    modes: [PanelMode, PanelMode],
    values: RangeValue<DateType>,
  ) => {
    setInnerModes(modes);

    if (onPanelChange) {
      onPanelChange(values, modes);
    }
  };

  // ========================= Disable Date ==========================
  const [disabledStartDate, disabledEndDate] = useRangeDisabled({
    picker,
    selectedValue,
    locale,
    disabled: mergedDisabled,
    disabledDate,
    generateConfig,
  });

  // ============================= Open ==============================
  const [mergedOpen, triggerInnerOpen] = useMergedState(false, {
    value: open,
    defaultValue: defaultOpen,
    postState: postOpen =>
      mergedDisabled[activePickerIndex] ? false : postOpen,
    onChange: newOpen => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      }

      if (!newOpen && operationRef.current && operationRef.current.onClose) {
        operationRef.current.onClose();
      }
    },
  });

  const startOpen = mergedOpen && activePickerIndex === 0;
  const endOpen = mergedOpen && activePickerIndex === 1;

  // ============================= Popup =============================
  // Popup min width
  const [popupMinWidth, setPopupMinWidth] = React.useState(0);
  React.useEffect(() => {
    if (!mergedOpen && containerRef.current) {
      setPopupMinWidth(containerRef.current.offsetWidth);
    }
  }, [mergedOpen]);

  // ============================ Trigger ============================
  let triggerOpen: (
    newOpen: boolean,
    index: 0 | 1,
    preventChangeEvent?: boolean,
  ) => void;

  const triggerChange = (
    newValue: RangeValue<DateType>,
    config: {
      source?: 'open';
      forceInput?: boolean;
    } = {},
  ) => {
    const { forceInput = true, source } = config;

    let values = newValue;
    const startValue = getValue(values, 0);
    let endValue = getValue(values, 1);

    // Clean up end date when start date is after end date
    if (
      startValue &&
      endValue &&
      !isSameDate(generateConfig, startValue, endValue) &&
      generateConfig.isAfter(startValue, endValue)
    ) {
      values = [startValue, null];
      endValue = null;
    }

    setSelectedValue(values);

    const startStr = startValue
      ? generateConfig.locale.format(locale.locale, startValue, formatList[0])
      : '';
    const endStr = endValue
      ? generateConfig.locale.format(locale.locale, endValue, formatList[0])
      : '';

    if (onCalendarChange) {
      onCalendarChange(values, [startStr, endStr]);
    }

    const canStartValueTrigger = canValueTrigger(
      startValue,
      0,
      mergedDisabled,
      allowEmpty,
    );
    const canEndValueTrigger = canValueTrigger(
      endValue,
      1,
      mergedDisabled,
      allowEmpty,
    );

    const canTrigger =
      values === null || (canStartValueTrigger && canEndValueTrigger);

    if (canTrigger) {
      // Trigger onChange only when value is validate
      setInnerValue(values);
      if (source !== 'open') {
        triggerOpen(false, activePickerIndex, true);
      }

      if (
        onChange &&
        (!isEqual(generateConfig, getValue(mergedValue, 0), startValue) ||
          !isEqual(generateConfig, getValue(mergedValue, 1), endValue))
      ) {
        onChange(values, [startStr, endStr]);
      }
    } else if (forceInput) {
      // Open miss value panel to force user input
      const missingValueIndex = canStartValueTrigger ? 1 : 0;

      // Same index means user choice to close picker
      if (missingValueIndex === activePickerIndex) {
        return;
      }

      if (source !== 'open') {
        triggerOpen(true, missingValueIndex);
      }

      // Delay to focus to avoid input blur trigger expired selectedValues
      setTimeout(() => {
        const inputRef = [startInputRef, endInputRef][missingValueIndex];
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  triggerOpen = (
    newOpen: boolean,
    index: 0 | 1,
    preventChangeEvent: boolean = false,
  ) => {
    if (newOpen) {
      setActivePickerIndex(index);
      triggerInnerOpen(newOpen);

      // Open to reset view date
      if (!mergedOpen) {
        setViewDate(null, index);
      }
    } else if (activePickerIndex === index) {
      triggerInnerOpen(newOpen);
      if (!preventChangeEvent) {
        triggerChange(selectedValue, { source: 'open' });
      }
    }
  };

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

  const startValueTexts = useValueTexts<DateType>(
    getValue(selectedValue, 0),
    sharedTextHooksProps,
  );

  const endValueTexts = useValueTexts<DateType>(
    getValue(selectedValue, 1),
    sharedTextHooksProps,
  );

  const onTextChange = (newText: string, index: 0 | 1) => {
    const inputDate = generateConfig.locale.parse(
      locale.locale,
      newText,
      formatList,
    );

    const disabledFunc = index === 0 ? disabledStartDate : disabledEndDate;

    if (inputDate && !disabledFunc(inputDate)) {
      setSelectedValue(updateValues(selectedValue, inputDate, index));
      setViewDate(inputDate, index);
    }
  };

  const [
    startText,
    triggerStartTextChange,
    resetStartText,
  ] = useTextValueMapping<DateType>({
    valueTexts: startValueTexts,
    onTextChange: newText => onTextChange(newText, 0),
  });

  const [endText, triggerEndTextChange, resetEndText] = useTextValueMapping<
    DateType
  >({
    valueTexts: endValueTexts,
    onTextChange: newText => onTextChange(newText, 1),
  });

  // ============================= Input =============================
  const getSharedInputHookProps = (index: 0 | 1, resetText: () => void) => ({
    blurToCancel: needConfirmButton,
    forwardKeyDown,
    onBlur,
    isClickOutside: (target: EventTarget | null) =>
      !elementsContains(
        [panelDivRef.current, startInputDivRef.current, endInputDivRef.current],
        target as HTMLElement,
      ),
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      setActivePickerIndex(index);
      if (onFocus) {
        onFocus(e);
      }
    },
    triggerOpen: (newOpen: boolean) => triggerOpen(newOpen, index),
    onSubmit: () => {
      triggerChange(selectedValue);
      resetText();
    },
    onCancel: () => {
      triggerOpen(false, index, true);
      setSelectedValue(mergedValue);
      resetText();
    },
  });

  const [
    startInputProps,
    { focused: startFocused, typing: startTyping },
  ] = usePickerInput({
    ...getSharedInputHookProps(0, resetStartText),
    open: startOpen,
  });

  const [
    endInputProps,
    { focused: endFocused, typing: endTyping },
  ] = usePickerInput({
    ...getSharedInputHookProps(1, resetEndText),
    open: endOpen,
  });

  // ============================= Sync ==============================
  // Close should sync back with text value
  const startStr =
    mergedValue && mergedValue[0]
      ? generateConfig.locale.format(
          locale.locale,
          mergedValue[0],
          'YYYYMMDDHHmmss',
        )
      : '';
  const endStr =
    mergedValue && mergedValue[1]
      ? generateConfig.locale.format(
          locale.locale,
          mergedValue[1],
          'YYYYMMDDHHmmss',
        )
      : '';

  React.useEffect(() => {
    if (!mergedOpen) {
      setSelectedValue(mergedValue);

      if (!startValueTexts.length || startValueTexts[0] === '') {
        triggerStartTextChange('');
      }
      if (!endValueTexts.length || endValueTexts[0] === '') {
        triggerEndTextChange('');
      }
    }
  }, [mergedOpen, startValueTexts, endValueTexts]);

  // Sync innerValue with control mode
  React.useEffect(() => {
    setSelectedValue(mergedValue);
  }, [startStr, endStr]);

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
  const rangeLabels = Object.keys(ranges || {});

  const rangeList = rangeLabels.map(label => {
    const range = ranges![label];
    const newValues = typeof range === 'function' ? range() : range;

    return {
      label,
      onClick: () => {
        triggerChange(newValues);
      },
      onMouseEnter: () => {
        setRangeHoverValue(newValues);
      },
      onMouseLeave: () => {
        setRangeHoverValue(null);
      },
    };
  });

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

    let panelShowTime:
      | boolean
      | SharedTimeProps<DateType>
      | undefined = showTime;
    if (showTime && typeof showTime === 'object' && showTime.defaultValue) {
      const timeDefaultValues: DateType[] = showTime.defaultValue!;
      panelShowTime = {
        ...showTime,
        defaultValue:
          getValue(timeDefaultValues, activePickerIndex) || undefined,
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
          showTime={panelShowTime}
          mode={mergedModes[activePickerIndex]}
          generateConfig={generateConfig}
          style={undefined}
          direction={direction}
          disabledDate={
            activePickerIndex === 0 ? disabledStartDate : disabledEndDate
          }
          disabledTime={date => {
            if (disabledTime) {
              return disabledTime(
                date,
                activePickerIndex === 0 ? 'start' : 'end',
              );
            }
            return false;
          }}
          className={classNames({
            [`${prefixCls}-panel-focused`]:
              activePickerIndex === 0 ? !startTyping : !endTyping,
          })}
          value={getValue(selectedValue, activePickerIndex)}
          locale={locale}
          tabIndex={-1}
          onPanelChange={(date, newMode) => {
            triggerModesChange(
              updateValues(mergedModes, newMode, activePickerIndex),
              updateValues(selectedValue, date, activePickerIndex),
            );

            setViewDate(date, activePickerIndex);
          }}
          onOk={null}
          onSelect={undefined}
          onChange={undefined}
          defaultValue={undefined}
          defaultPickerValue={undefined}
        />
      </RangeContext.Provider>
    );
  }

  let arrowLeft: number = 0;
  let panelLeft: number = 0;
  if (
    activePickerIndex &&
    startInputDivRef.current &&
    separatorRef.current &&
    panelDivRef.current
  ) {
    // Arrow offset
    arrowLeft =
      startInputDivRef.current.offsetWidth + separatorRef.current.offsetWidth;

    if (
      panelDivRef.current.offsetWidth &&
      arrowLeft > panelDivRef.current.offsetWidth
    ) {
      panelLeft = arrowLeft;
    }
  }

  const arrowPositionStyle =
    direction === 'rtl' ? { right: arrowLeft } : { left: arrowLeft };

  function renderPanels() {
    let panels: React.ReactNode;
    const extraNode = getExtraFooter(
      prefixCls,
      mergedModes[activePickerIndex],
      renderExtraFooter,
    );

    const rangesNode = getRanges({
      prefixCls,
      components,
      needConfirmButton,
      okDisabled: !getValue(selectedValue, activePickerIndex),
      locale,
      rangeList,
      onOk: () => {
        if (getValue(selectedValue, activePickerIndex)) {
          triggerChange(selectedValue);
          if (onOk) {
            onOk(selectedValue);
          }
        }
      },
    });

    if (picker !== 'time' && !showTime) {
      const viewDate = getViewDate(activePickerIndex);
      const nextViewDate = getClosingViewDate(viewDate, picker, generateConfig);
      const currentMode = mergedModes[activePickerIndex];

      const showDoublePanel = currentMode === picker;
      const leftPanel = renderPanel(showDoublePanel ? 'left' : false, {
        pickerValue: viewDate,
        onPickerValueChange: newViewDate => {
          setViewDate(newViewDate, activePickerIndex);
        },
      });
      const rightPanel = renderPanel('right', {
        pickerValue: nextViewDate,
        onPickerValueChange: newViewDate => {
          setViewDate(
            getClosingViewDate(newViewDate, picker, generateConfig, -1),
            activePickerIndex,
          );
        },
      });

      panels = (
        <>
          {direction === 'rtl' ? rightPanel : leftPanel}
          {direction === 'rtl'
            ? showDoublePanel && leftPanel
            : showDoublePanel && rightPanel}
        </>
      );
    } else {
      panels = renderPanel();
    }

    return (
      <div
        className={`${prefixCls}-panel-container`}
        style={{ marginLeft: panelLeft }}
        ref={panelDivRef}
        onMouseDown={e => {
          e.preventDefault();
        }}
      >
        <div className={`${prefixCls}-panels`}>{panels}</div>
        {(extraNode || rangesNode) && (
          <div className={`${prefixCls}-footer`}>
            {extraNode}
            {rangesNode}
          </div>
        )}
      </div>
    );
  }

  const rangePanel = (
    <div
      className={classNames(
        `${prefixCls}-range-wrapper`,
        `${prefixCls}-${picker}-range-wrapper`,
      )}
      style={{ minWidth: popupMinWidth }}
    >
      <div className={`${prefixCls}-range-arrow`} style={arrowPositionStyle} />

      {renderPanels()}
    </div>
  );

  // ============================= Icons =============================
  let suffixNode: React.ReactNode;
  if (suffixIcon) {
    suffixNode = <span className={`${prefixCls}-suffix`}>{suffixIcon}</span>;
  }

  let clearNode: React.ReactNode;
  if (
    allowClear &&
    ((getValue(mergedValue, 0) && !mergedDisabled[0]) ||
      (getValue(mergedValue, 1) && !mergedDisabled[1]))
  ) {
    clearNode = (
      <span
        onMouseDown={e => {
          e.preventDefault();
          e.stopPropagation();
          let values = mergedValue;

          if (!mergedDisabled[0]) {
            values = updateValues(values, null, 0);
          }
          if (!mergedDisabled[1]) {
            values = updateValues(values, null, 1);
          }

          triggerChange(values, { forceInput: false });
        }}
        className={`${prefixCls}-clear`}
      >
        {clearIcon || <span className={`${prefixCls}-clear-btn`} />}
      </span>
    );
  }

  const inputSharedProps = {
    size: getInputSize(picker, formatList[0]),
  };

  let activeBarLeft: number = 0;
  let activeBarWidth: number = 0;
  if (
    startInputDivRef.current &&
    endInputDivRef.current &&
    separatorRef.current
  ) {
    if (activePickerIndex === 0) {
      activeBarWidth = startInputDivRef.current.offsetWidth;
    } else {
      activeBarLeft = arrowLeft;
      activeBarWidth = endInputDivRef.current.offsetWidth;
    }
  }
  const activeBarPositionStyle =
    direction === 'rtl' ? { right: activeBarLeft } : { left: activeBarLeft };
  // ============================ Return =============================
  const onContextSelect = (
    date: DateType,
    type: 'key' | 'mouse' | 'submit',
  ) => {
    const values = updateValues(selectedValue, date, activePickerIndex);

    if (type === 'submit' || (type !== 'key' && !needConfirmButton)) {
      // triggerChange will also update selected values
      triggerChange(values);
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
            [`${prefixCls}-focused`]:
              activePickerIndex === 0 ? startFocused : endFocused,
            [`${prefixCls}-rtl`]: direction === 'rtl',
          })}
          style={style}
          {...getDataOrAriaProps(props)}
        >
          <div
            className={classNames(`${prefixCls}-input`, {
              [`${prefixCls}-input-active`]: activePickerIndex === 0,
            })}
            ref={startInputDivRef}
          >
            <input
              disabled={mergedDisabled[0]}
              readOnly={inputReadOnly || !startTyping}
              value={startText}
              onChange={e => {
                triggerStartTextChange(e.target.value);
              }}
              autoFocus={autoFocus}
              placeholder={getValue(placeholder, 0) || ''}
              ref={startInputRef}
              {...startInputProps}
              {...inputSharedProps}
            />
          </div>
          <div className={`${prefixCls}-range-separator`} ref={separatorRef}>
            {separator}
          </div>
          <div
            className={classNames(`${prefixCls}-input`, {
              [`${prefixCls}-input-active`]: activePickerIndex === 1,
            })}
            ref={endInputDivRef}
          >
            <input
              disabled={mergedDisabled[1]}
              readOnly={inputReadOnly || !endTyping}
              value={endText}
              onChange={e => {
                triggerEndTextChange(e.target.value);
              }}
              placeholder={getValue(placeholder, 1) || ''}
              ref={endInputRef}
              {...endInputProps}
              {...inputSharedProps}
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
class RangePicker<DateType> extends React.Component<
  RangePickerProps<DateType>
> {
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

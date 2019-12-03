import * as React from 'react';
import classNames from 'classnames';
import { DisabledTimes, PanelMode, PickerMode } from './interface';
import {
  PickerBaseProps,
  PickerDateProps,
  PickerTimeProps,
  PickerRefConfig,
} from './Picker';
import { SharedTimeProps } from './panels/TimePanel';
import useMergedState from './hooks/useMergeState';
import PickerTrigger from './PickerTrigger';
import PickerPanel from './PickerPanel';
import usePickerInput from './hooks/usePickerInput';
import getDataOrAriaProps, { toArray } from './utils/miscUtil';
import { getDefaultFormat, getInputSize } from './utils/uiUtil';
import PanelContext, { ContextOperationRefProps } from './PanelContext';
import {
  isEqual,
  getClosingViewDate,
  isSameDate,
  isSameMonth,
  isSameYear,
} from './utils/dateUtil';
import useValueTexts from './hooks/useValueTexts';
import useTextValueMapping from './hooks/useTextValueMapping';
import { GenerateConfig } from './generate';
import { PickerPanelProps } from '.';
import RangeContext from './RangeContext';

type EventValue<DateType> = DateType | null;
type RangeValue<DateType> = [EventValue<DateType>, EventValue<DateType>] | null;

function getIndexValue<T>(
  values: null | undefined | [T | null, T | null],
  index: number,
): T | null {
  return values ? values[index] : null;
}

type UpdateValue<T> = (prev: T) => T;

function updateRangeValue<T, R = [T | null, T | null] | null>(
  values: [T | null, T | null] | null,
  value: T | UpdateValue<T>,
  index: number,
): R {
  const newValues: [T | null, T | null] = [
    getIndexValue(values, 0),
    getIndexValue(values, 1),
  ];

  newValues[index] =
    typeof value === 'function'
      ? (value as UpdateValue<T | null>)(newValues[index])
      : value;

  if (!newValues[0] && !newValues[1]) {
    return (null as unknown) as R;
  }

  return (newValues as unknown) as R;
}

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

export interface RangePickerSharedProps<DateType> {
  value?: RangeValue<DateType>;
  defaultValue?: RangeValue<DateType>;
  defaultPickerValue?: [DateType, DateType];
  placeholder?: [string, string];
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
  selectable?: [boolean, boolean];
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
}

type OmitPickerProps<Props> = Omit<
  Props,
  | 'value'
  | 'defaultValue'
  | 'defaultPickerValue'
  | 'placeholder'
  | 'disabledTime'
  | 'showToday'
  | 'showTime'
  | 'mode'
  | 'onChange'
  | 'onSelect'
  | 'onPanelChange'
  | 'pickerValue'
  | 'onPickerValueChange'
>;

export interface RangePickerBaseProps<DateType>
  extends RangePickerSharedProps<DateType>,
    OmitPickerProps<PickerBaseProps<DateType>> {}

export interface RangePickerDateProps<DateType>
  extends RangePickerSharedProps<DateType>,
    OmitPickerProps<PickerDateProps<DateType>> {
  showTime?:
    | boolean
    | (Omit<SharedTimeProps<DateType>, 'defaultValue'> & {
        defaultValue?: DateType[];
      });
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
    allowClear,
    suffixIcon,
    clearIcon,
    pickerRef,
    inputReadOnly,
    mode,
    onChange,
    onOpenChange,
    onPanelChange,
    onFocus,
    onBlur,
  } = props as MergedRangePickerProps<DateType>;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const panelDivRef = React.useRef<HTMLDivElement>(null);
  const startInputDivRef = React.useRef<HTMLDivElement>(null);
  const endInputDivRef = React.useRef<HTMLDivElement>(null);
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

  // ============================= Value =============================
  const [mergedValue, setInnerValue] = useMergedState({
    value,
    defaultValue,
    defaultStateValue: null,
    postState: values => reorderValues(values, generateConfig),
  });

  // =========================== View Date ===========================
  /**
   * End view date is use right panel by default.
   * But when they in same month (date picker) or year (month picker), will both use left panel.
   */
  function getEndViewDate(viewDate: DateType, values: RangeValue<DateType>) {
    let compareFunc: (
      generateConfig: GenerateConfig<DateType>,
      date1: DateType | null,
      date2: DateType | null,
    ) => boolean = isSameMonth;

    if (picker === 'month') {
      compareFunc = isSameYear;
    }

    if (
      compareFunc(
        generateConfig,
        getIndexValue(values, 0),
        getIndexValue(values, 1),
      )
    ) {
      return viewDate;
    }
    return getClosingViewDate(viewDate, picker, generateConfig, -1);
  }

  // Config view panel
  const [viewDates, setViewDates] = useMergedState<
    RangeValue<DateType>,
    [DateType, DateType]
  >({
    defaultValue:
      defaultPickerValue ||
      updateRangeValue(
        mergedValue,
        (viewDate: DateType) => getEndViewDate(viewDate, mergedValue),
        1,
      ),
    defaultStateValue: null,
    postState: postViewDates =>
      postViewDates || [generateConfig.getNow(), generateConfig.getNow()],
  });

  // ========================= Select Values =========================
  const [selectedValue, setSelectedValue] = React.useState<
    RangeValue<DateType>
  >(mergedValue);

  // ============================= Modes =============================
  const [mergedModes, setInnerModes] = useMergedState<[PanelMode, PanelMode]>({
    value: mode,
    defaultStateValue: [picker, picker],
  });

  const triggerModesChange = (
    modes: [PanelMode, PanelMode],
    values: RangeValue<DateType>,
  ) => {
    setInnerModes(modes);

    if (onPanelChange) {
      onPanelChange(values, modes);
    }
  };

  // ============================= Open ==============================
  const [mergedOpen, triggerInnerOpen] = useMergedState({
    value: open,
    defaultValue: defaultOpen,
    defaultStateValue: false,
    postState: postOpen => (disabled ? false : postOpen),
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
  const triggerChange = (newValue: RangeValue<DateType>) => {
    const values = reorderValues(newValue, generateConfig);

    setSelectedValue(values);
    setInnerValue(values);

    const startValue = getIndexValue(values, 0);
    const endValue = getIndexValue(values, 1);

    if (
      onChange &&
      (!isEqual(generateConfig, getIndexValue(mergedValue, 0), startValue) ||
        !isEqual(generateConfig, getIndexValue(mergedValue, 1), endValue))
    ) {
      onChange(values, [
        startValue
          ? generateConfig.locale.format(
              locale.locale,
              startValue,
              formatList[0],
            )
          : '',
        endValue
          ? generateConfig.locale.format(locale.locale, endValue, formatList[0])
          : '',
      ]);
    }
  };

  const triggerOpen = (
    newOpen: boolean,
    index: 0 | 1,
    preventChangeEvent: boolean = false,
  ) => {
    if (newOpen) {
      setActivePickerIndex(index);
      triggerInnerOpen(newOpen);
    } else if (activePickerIndex === index) {
      triggerInnerOpen(newOpen);
      if (!preventChangeEvent) {
        triggerChange(selectedValue);
      }
    }
  };

  const forwardKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (mergedOpen && operationRef.current && operationRef.current.onKeyDown) {
      // Let popup panel handle keyboard
      return operationRef.current.onKeyDown(e);
    }
    return false;
  };

  // ============================= Text ==============================
  const sharedTextHooksProps = {
    formatList,
    generateConfig,
    locale,
  };

  const startValueTexts = useValueTexts<DateType>(
    getIndexValue(selectedValue, 0),
    sharedTextHooksProps,
  );

  const endValueTexts = useValueTexts<DateType>(
    getIndexValue(selectedValue, 1),
    sharedTextHooksProps,
  );

  const onTextChange = (newText: string, index: 0 | 1) => {
    const inputDate = generateConfig.locale.parse(
      locale.locale,
      newText,
      formatList,
    );
    if (inputDate && (!disabledDate || !disabledDate(inputDate))) {
      setSelectedValue(updateRangeValue(selectedValue, inputDate, index));
      setViewDates(updateRangeValue(viewDates, inputDate, index));
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
  const sharedInputHookProps = {
    forwardKeyDown,
    onBlur,
  };

  const passOnFocus: React.FocusEventHandler<HTMLInputElement> = e => {
    if (onFocus) {
      onFocus(e);
    }
  };

  const [
    startInputProps,
    { focused: startFocused, typing: startTyping },
  ] = usePickerInput({
    ...sharedInputHookProps,
    open: startOpen,
    isClickOutside: (target: EventTarget | null) =>
      !!(
        panelDivRef.current &&
        !panelDivRef.current.contains(target as Node) &&
        startInputDivRef.current &&
        !startInputDivRef.current.contains(target as Node) &&
        onOpenChange
      ),
    onFocus: e => {
      setActivePickerIndex(0);
      passOnFocus(e);
    },
    triggerOpen: newOpen => triggerOpen(newOpen, 0),
    onSubmit: () => {
      triggerChange(selectedValue);
      triggerOpen(false, 0, true);
      resetStartText();
    },
    onCancel: () => {
      triggerOpen(false, 0, true);
      setSelectedValue(mergedValue);
      resetStartText();
    },
  });

  const [
    endInputProps,
    { focused: endFocused, typing: endTyping },
  ] = usePickerInput({
    ...sharedInputHookProps,
    open: endOpen,
    isClickOutside: (target: EventTarget | null) =>
      !!(
        panelDivRef.current &&
        !panelDivRef.current.contains(target as Node) &&
        endInputDivRef.current &&
        !endInputDivRef.current.contains(target as Node) &&
        onOpenChange
      ),
    onFocus: e => {
      setActivePickerIndex(1);
      passOnFocus(e);
    },
    triggerOpen: newOpen => triggerOpen(newOpen, 1),
    onSubmit: () => {
      triggerChange(selectedValue);
      triggerOpen(false, 1, true);
      resetEndText();
    },
    onCancel: () => {
      triggerOpen(false, 1, true);
      setSelectedValue(mergedValue);
      resetEndText();
    },
  });

  // ============================= Sync ==============================
  // Close should sync back with text value
  React.useEffect(() => {
    if (!mergedOpen) {
      setSelectedValue(mergedValue);
    }
  }, [mergedOpen]);

  // Sync innerValue with control mode
  React.useEffect(() => {
    // Sync select value
    setSelectedValue(mergedValue);
  }, [mergedValue]);

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

  // ============================= Panel =============================

  function renderPanel(
    startPanel?: boolean,
    panelProps: Partial<PickerPanelProps<DateType>> = {},
  ) {
    return (
      <RangeContext.Provider
        value={{
          inRange: true,
          startPanel,
        }}
      >
        <PickerPanel<DateType>
          {...(props as any)}
          {...panelProps}
          mode={mergedModes[activePickerIndex]}
          generateConfig={generateConfig}
          style={undefined}
          className={classNames({
            [`${prefixCls}-panel-focused`]: !startTyping && !endTyping,
          })}
          value={getIndexValue(selectedValue, activePickerIndex)}
          locale={locale}
          tabIndex={-1}
          onMouseDown={e => {
            e.preventDefault();
          }}
          onChange={date => {
            setSelectedValue(
              updateRangeValue(selectedValue, date, activePickerIndex),
            );
          }}
          onPanelChange={(date, newMode) => {
            triggerModesChange(
              updateRangeValue(mergedModes, newMode, activePickerIndex),
              updateRangeValue(selectedValue, date, activePickerIndex),
            );
          }}
        />
      </RangeContext.Provider>
    );
  }

  function renderPanels() {
    if (picker !== 'time' && !showTime) {
      const viewDate = viewDates[activePickerIndex];
      const nextViewDate = getClosingViewDate(viewDate, picker, generateConfig);
      const currentMode = mergedModes[activePickerIndex];

      return (
        <>
          {renderPanel(true, {
            pickerValue: viewDate,
            onPickerValueChange: newViewDate => {
              setViewDates(
                updateRangeValue(viewDates, newViewDate, activePickerIndex),
              );
            },
          })}
          {currentMode === picker &&
            renderPanel(false, {
              pickerValue: nextViewDate,
              onPickerValueChange: newViewDate => {
                setViewDates(
                  updateRangeValue(
                    viewDates,
                    getClosingViewDate(newViewDate, picker, generateConfig, -1),
                    activePickerIndex,
                  ),
                );
              },
            })}
        </>
      );
    }
    return renderPanel();
  }

  const rangePanel = (
    <div style={{ minWidth: popupMinWidth }}>
      <div className={`${prefixCls}-range-arrow`} />

      {renderPanels()}
    </div>
  );

  let suffixNode: React.ReactNode;
  if (suffixIcon) {
    suffixNode = <span className={`${prefixCls}-suffix`}>{suffixIcon}</span>;
  }

  let clearNode: React.ReactNode;
  if (allowClear && mergedValue && !disabled) {
    clearNode = (
      <span
        onClick={e => {
          e.stopPropagation();
          triggerChange(null);
        }}
        className={`${prefixCls}-clear`}
      >
        {clearIcon || <span className={`${prefixCls}-clear-btn`} />}
      </span>
    );
  }

  const inputSharedProps = {
    disabled,
    size: getInputSize(picker, formatList[0]),
  };

  return (
    <PanelContext.Provider
      value={{
        operationRef,
        hideHeader: picker === 'time',
        panelRef: panelDivRef,
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
      >
        <div
          ref={containerRef}
          className={classNames(`${prefixCls}-range`, className, {
            [`${prefixCls}-range-disabled`]: disabled,
            [`${prefixCls}-range-focused`]: startFocused || endFocused,
          })}
          style={style}
          {...getDataOrAriaProps(props)}
        >
          <div className={`${prefixCls}-input`} ref={startInputDivRef}>
            <input
              readOnly={inputReadOnly || !startTyping}
              value={startText}
              onChange={triggerStartTextChange}
              autoFocus={autoFocus}
              placeholder={getIndexValue(placeholder, 0) || ''}
              ref={startInputRef}
              {...startInputProps}
              {...inputSharedProps}
            />
          </div>
          {separator}
          <div className={`${prefixCls}-input`} ref={startInputDivRef}>
            <input
              readOnly={inputReadOnly || !startTyping}
              value={endText}
              onChange={triggerEndTextChange}
              placeholder={getIndexValue(placeholder, 1) || ''}
              ref={endInputRef}
              {...endInputProps}
              {...inputSharedProps}
            />
          </div>
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

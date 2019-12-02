import * as React from 'react';
import classNames from 'classnames';
import { DisabledTimes, PanelMode, PickerMode } from './interface';
import { PickerBaseProps, PickerDateProps, PickerTimeProps } from './Picker';
import { SharedTimeProps } from './panels/TimePanel';
import useMergedState from './hooks/useMergeState';
import PickerTrigger from './PickerTrigger';
import PickerPanel from './PickerPanel';
import usePickerInput from './hooks/usePickerInput';
import getDataOrAriaProps, { toArray } from './utils/miscUtil';
import { getDefaultFormat, getInputSize } from './utils/uiUtil';
import { ContextOperationRefProps } from './PanelContext';
import { isEqual } from './utils/dateUtil';
import useValueTexts from './hooks/useValueTexts';
import useTextValueMapping from './hooks/useTextValueMapping';
import { GenerateConfig } from './generate';

type EventValue<DateType> = DateType | null;
type RangeValue<DateType> = [EventValue<DateType>, EventValue<DateType>] | null;

function getIndexValue<T>(
  values: null | undefined | [T | null, T | null],
  index: number,
): T | null {
  return values ? values[index] : null;
}

function updateRangeValue<DateType>(
  values: RangeValue<DateType>,
  value: DateType,
  index: number,
) {
  const newValues: RangeValue<DateType> = [
    getIndexValue(values, 0),
    getIndexValue(values, 1),
  ];

  newValues[index] = value;

  if (!newValues[0] && !newValues[1]) {
    return null;
  }

  return newValues;
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

function RangePicker<DateType>(props: RangePickerProps<DateType>) {
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
    picker,
    showTime,
    use12Hours,
    separator = '~',
    value,
    defaultValue,
    open,
    defaultOpen,
    disabledDate,
    allowClear,
    suffixIcon,
    clearIcon,
    inputReadOnly,
    onChange,
    onOpenChange,
    onFocus,
    onBlur,
  } = props as MergedRangePickerProps<DateType>;

  const startInputRef = React.useRef<HTMLInputElement>(null);
  const endInputRef = React.useRef<HTMLInputElement>(null);

  // ======================== State ========================
  const formatList = toArray(
    getDefaultFormat(format, picker, showTime, use12Hours),
  );

  // Active picker
  const [activePickerIndex, setActivePickerIndex] = React.useState<0 | 1>(0);

  // Panel ref
  const panelDivRef = React.useRef<HTMLDivElement>(null);
  const startInputDivRef = React.useRef<HTMLDivElement>(null);
  const endInputDivRef = React.useRef<HTMLDivElement>(null);

  // Real value
  const [mergedValue, setInnerValue] = useMergedState({
    value,
    defaultValue,
    defaultStateValue: null,
    postState: values => reorderValues(values, generateConfig),
  });

  // Selected value
  const [selectedValue, setSelectedValue] = React.useState<
    RangeValue<DateType>
  >(mergedValue);

  // Operation ref
  const operationRef: React.MutableRefObject<ContextOperationRefProps | null> = React.useRef<
    ContextOperationRefProps
  >(null);

  // Open
  const [mergedOpen, triggerOpen] = useMergedState({
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

  const forwardKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (mergedOpen && operationRef.current && operationRef.current.onKeyDown) {
      // Let popup panel handle keyboard
      return operationRef.current.onKeyDown(e);
    }
    return false;
  };

  const triggerClose = () => {
    triggerOpen(false);
    triggerChange(selectedValue);
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
    }
  };

  const [startText, triggerStartTextChange] = useTextValueMapping<DateType>({
    valueTexts: startValueTexts,
    onTextChange: newText => onTextChange(newText, 0),
  });

  const [endText, triggerEndTextChange] = useTextValueMapping<DateType>({
    valueTexts: endValueTexts,
    onTextChange: newText => onTextChange(newText, 1),
  });

  // ============================= Input =============================
  const sharedInputHookProps = {
    triggerOpen,
    triggerClose,
    forwardKeyDown,
    onSubmit: () => {
      triggerChange(selectedValue);
    },
    onCancel: () => {
      triggerChange(mergedValue);
      setSelectedValue(mergedValue);
    },
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
  // TODO: pickerRef

  // ============================= Panel =============================
  const panelProps = {
    ...(props as any),
    className: undefined,
    style: undefined,
  };

  const panel = (
    <PickerPanel<DateType>
      {...panelProps}
      generateConfig={generateConfig}
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
    />
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
    <PickerTrigger
      visible={mergedOpen}
      popupElement={panel}
      popupStyle={popupStyle}
      prefixCls={prefixCls}
      dropdownClassName={dropdownClassName}
      dropdownAlign={dropdownAlign}
      getPopupContainer={getPopupContainer}
      transitionName={transitionName}
    >
      <div
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
  );
}

export default RangePicker;

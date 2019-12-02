import * as React from 'react';
import classNames from 'classnames';
import { DisabledTimes, PanelMode } from './interface';
import { PickerBaseProps, PickerDateProps, PickerTimeProps } from './Picker';
import { SharedTimeProps } from './panels/TimePanel';
import useMergedState from './hooks/useMergeState';
import PickerTrigger from './PickerTrigger';
import PickerPanel from './PickerPanel';

type EventValue<DateType> = DateType | null;
type RangeValue<DateType> =
  | [EventValue<DateType> | null, EventValue<DateType> | null]
  | null;

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
    separator = '~',
    value,
    defaultValue,
    open,
    defaultOpen,
    onChange,
  } = props;

  // ======================== States ========================
  // Value
  const [mergedValue, triggerValueChange] = useMergedState<
    RangeValue<DateType>
  >({
    value,
    defaultValue,
    defaultStateValue: null,
    onChange: (nextValue, prevValue) => {
      // TODO: handle this
      console.log('Value Changed!', nextValue, prevValue);
    },
  });

  // Open
  const [mergedOpen, triggerOpenChange] = useMergedState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    defaultStateValue: false,
    onChange: nextOpen => {
      console.log('Open Changed!', nextOpen);
    },
  });

  // ======================== Typing ========================

  // ======================== Panels ========================
  const panel = (
    <PickerPanel<DateType>
      generateConfig={generateConfig}
      locale={locale}
      tabIndex={-1}
      onMouseDown={e => {
        e.preventDefault();
      }}
    />
  );

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
        className={classNames(`${prefixCls}-range`, className)}
        style={style}
      >
        <input />
        {separator}
        <input />
      </div>
    </PickerTrigger>
  );
}

export default RangePicker;

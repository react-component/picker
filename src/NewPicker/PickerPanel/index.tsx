import { useEvent, useMergedState } from 'rc-util';
import * as React from 'react';
import useLocale from '../hooks/useLocale';
import { getTimeConfig } from '../hooks/useTimeConfig';
import useToggleDates from '../hooks/useToggleDates';
import type {
  CellRender,
  Components,
  InternalMode,
  OnPanelChange,
  PanelMode,
  PickerMode,
  SharedPanelProps,
  SharedTimeProps,
} from '../interface';
import PickerContext from '../PickerInput/context';
import { toArray } from '../util';
import DatePanel from './DatePanel';
import DateTimePanel from './DateTimePanel';
import DecadePanel from './DecadePanel';
import MonthPanel from './MonthPanel';
import QuarterPanel from './QuarterPanel';
import TimePanel from './TimePanel';
import WeekPanel from './WeekPanel';
import YearPanel from './YearPanel';

const DefaultComponents: Components = {
  date: DatePanel,
  datetime: DateTimePanel,
  week: WeekPanel,
  month: MonthPanel,
  quarter: QuarterPanel,
  year: YearPanel,
  decade: DecadePanel,
  time: TimePanel,
};

export interface PickerPanelRef {
  nativeElement: HTMLDivElement;
}

export interface BasePickerPanelProps<DateType extends object = any>
  extends Pick<
    SharedPanelProps<DateType>,
    // MISC
    | 'locale'
    | 'generateConfig'
    // Disabled
    | 'disabledDate'
  > {
  // Style
  prefixCls?: string;

  // Value
  onSelect?: (date: DateType) => void;

  // Panel control
  defaultPickerValue?: DateType | null;
  pickerValue?: DateType | null;
  onPickerValueChange?: (
    date: DateType,
    info: {
      mode: PanelMode;
    },
  ) => void;

  // Mode
  mode?: PanelMode;
  /**
   * @deprecated You can get more info from `onPickerValueChange` instead.
   * Compatible with origin API.
   * Not mean the PickerPanel `onChange` event.
   */
  onPanelChange?: OnPanelChange<DateType>;
  picker?: PickerMode;

  // Time
  showTime?: true | SharedTimeProps<DateType>;

  // Week
  /**
   * Only worked in `date` mode. Show the current week
   */
  showWeek?: boolean;

  // Cell
  cellRender?: CellRender<DateType>;

  // Hover
  hoverValue?: DateType | [start: DateType, end: DateType];
  onHover?: (date: DateType) => void;

  // Components
  components?: Components;
}

export interface SinglePickerPanelProps<DateType extends object = any>
  extends BasePickerPanelProps<DateType> {
  multiple?: false;

  defaultValue?: DateType | null;
  value?: DateType | null;
  onChange?: (date: DateType) => void;
}

export interface MultiplePickerPanelProps<DateType extends object = any>
  extends BasePickerPanelProps<DateType> {
  /** multiple selection. Not support time or datetime picker */
  multiple: true;

  defaultValue?: DateType[] | null;
  value?: DateType[] | null;
  onChange?: (date: DateType[]) => void;
}

// export type PickerPanelProps<DateType extends object = any> =
//   | SinglePickerPanelProps<DateType>
//   | MultiplePickerPanelProps<DateType>;
export type PickerPanelProps<DateType extends object = any> = BasePickerPanelProps<DateType> & {
  /** multiple selection. Not support time or datetime picker */
  multiple?: boolean;

  defaultValue?: DateType | DateType[] | null;
  value?: DateType | DateType[] | null;
  onChange?: (date: DateType | DateType[]) => void;
};

// type InternalPickerPanelProps<DateType extends object = any> = Omit<
//   PickerPanelProps<DateType>,
//   'onChange'
// > & {
//   onChange?: (date: DateType | DateType[]) => void;
// };

function PickerPanel<DateType extends object = any>(
  props: PickerPanelProps<DateType>,
  ref: React.Ref<PickerPanelRef>,
) {
  const {
    locale,
    disabledDate,
    generateConfig,

    // Style
    prefixCls,

    // Value
    multiple,
    defaultValue,
    value,
    onChange,
    onSelect,

    // Picker control
    defaultPickerValue,
    pickerValue,
    onPickerValueChange,

    // Mode
    mode,
    onPanelChange,
    picker = 'date',

    // Hover
    hoverValue,
    onHover,

    // Week
    showWeek,

    // Cell
    cellRender,

    // Components
    components = {},
  } = props;

  const mergedPrefixCls = React.useContext(PickerContext)?.prefixCls || prefixCls || 'rc-picker';

  // ========================== Refs ==========================
  const rootRef = React.useRef<HTMLDivElement>();

  React.useImperativeHandle(ref, () => ({
    nativeElement: rootRef.current,
  }));

  // ========================= Locale =========================
  const filledLocale = useLocale(locale);

  // ======================== ShowTime ========================
  const mergedShowTime = getTimeConfig(props);

  // ========================== Now ===========================
  const now = generateConfig.getNow();

  // ========================== Mode ==========================
  const [mergedMode, setMergedMode] = useMergedState<PanelMode>(picker, {
    value: mode,
    postState: (val) => val || 'date',
  });

  const internalMode: InternalMode =
    mergedMode === 'date' && mergedShowTime ? 'datetime' : mergedMode;
  const internalPicker: InternalMode = picker === 'date' && mergedShowTime ? 'datetime' : picker;

  // ========================= Toggle =========================
  const toggleDates = useToggleDates(generateConfig, locale, internalPicker);

  // ========================= Value ==========================
  // >>> Real value
  // Interactive with `onChange` event which only trigger when the `mode` is `picker`
  const [innerValue, setMergedValue] = useMergedState(defaultValue, {
    value,
  });

  const mergedValue = React.useMemo(() => {
    const values = toArray(innerValue);
    return multiple ? values : values.slice(0, 1);
  }, [innerValue, multiple]);

  // Sync value and only trigger onChange event when changed
  const triggerChange = useEvent((nextValue: DateType[] | null) => {
    setMergedValue(nextValue);

    // TODO: compare values

    if (
      onChange
      // &&
      // !isSame(
      //   generateConfig,
      //   locale,
      //   mergedValue,
      //   nextValue,
      //   picker === 'date' && mergedShowTime ? 'datetime' : picker,
      // )
    ) {
      onChange?.(multiple ? nextValue : nextValue[0]);
    }
  });

  // >>> CalendarValue
  // CalendarValue is a temp value for user operation
  // which will only trigger `onCalendarChange` but not `onChange`
  const onInternalSelect = useEvent((newDate: DateType) => {
    onSelect?.(newDate);

    if (mergedMode === picker) {
      const nextValues = multiple ? toggleDates(mergedValue, newDate) : [newDate];

      triggerChange(nextValues);
    }
  });

  // >>> PickerValue
  // PickerValue is used to control the current displaying panel
  const [mergedPickerValue, setInternalPickerValue] = useMergedState(
    defaultPickerValue || mergedValue[0] || now,
    {
      value: pickerValue,
    },
  );

  const setPickerValue = (nextPickerValue: DateType, nextMode?: PanelMode) => {
    setInternalPickerValue(nextPickerValue);

    onPickerValueChange?.(nextPickerValue, {
      mode: nextMode || mergedMode,
    });
  };

  const triggerModeChange = (nextMode: PanelMode, viewDate?: DateType) => {
    setMergedMode(nextMode);

    if (viewDate) {
      setPickerValue(viewDate, nextMode);
    }

    onPanelChange?.(viewDate || pickerValue, nextMode);
  };

  const onPanelValueSelect = (nextValue: DateType) => {
    onInternalSelect(nextValue);
    setPickerValue(nextValue);

    // Update mode if needed
    if (mergedMode !== picker) {
      const queue: PanelMode[] = ['decade', 'year', 'month'];
      const index = queue.indexOf(mergedMode);
      const nextMode = queue[index + 1];
      if (index >= 0 && nextMode) {
        triggerModeChange(nextMode, nextValue);
      } else if (mergedMode === 'month') {
        if (picker === 'date') {
          triggerModeChange('date', nextValue);
        } else if (picker === 'week') {
          triggerModeChange('week', nextValue);
        }
      }
    }
  };

  // ======================= Hover Date =======================
  const hoverRangeDate = React.useMemo<[DateType, DateType] | null>(() => {
    let start: DateType;
    let end: DateType;

    if (Array.isArray(hoverValue)) {
      [start, end] = hoverValue;
    } else {
      start = hoverValue;
    }

    // Return for not exist
    if (!start && !end) {
      return null;
    }

    // Fill if has empty
    start = start || end;
    end = end || start;

    return generateConfig.isAfter(start, end) ? [end, start] : [start, end];
  }, [hoverValue, generateConfig]);

  // ======================= Components =======================
  const PanelComponent = components[internalMode] || DefaultComponents[internalMode] || DatePanel;

  // ========================= Render =========================
  return (
    <div ref={rootRef} className={`${mergedPrefixCls}-panel`}>
      <PanelComponent
        // Time
        showTime={mergedShowTime}
        // Week
        showWeek={showWeek}
        // MISC
        prefixCls={mergedPrefixCls}
        locale={filledLocale}
        generateConfig={generateConfig}
        // Mode
        onModeChange={triggerModeChange}
        // Value
        pickerValue={mergedPickerValue}
        onPickerValueChange={setPickerValue}
        value={mergedValue[0]}
        onSelect={onPanelValueSelect}
        values={mergedValue}
        // Render
        cellRender={cellRender}
        disabledDate={disabledDate}
        // Hover
        hoverValue={hoverRangeDate}
        onHover={onHover}
      />
    </div>
  );
}

const RefPanelPicker = React.memo(React.forwardRef(PickerPanel));

if (process.env.NODE_ENV !== 'production') {
  RefPanelPicker.displayName = 'PanelPicker';
}

// Make support generic
export default RefPanelPicker as <DateType extends object = any>(
  props: PickerPanelProps<DateType> & { ref?: React.Ref<PickerPanelRef> },
) => React.ReactElement;

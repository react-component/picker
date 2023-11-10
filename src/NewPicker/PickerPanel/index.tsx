import { useMergedState } from 'rc-util';
import * as React from 'react';
import useTimeConfig from '../hooks/useTimeConfig';
import type {
  CellRender,
  Components,
  OnPanelChange,
  PanelMode,
  PickerMode,
  SharedPanelProps,
  SharedTimeProps,
} from '../interface';
import PickerContext from '../PickerInput/context';
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

export interface PickerPanelProps<DateType = any>
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
  defaultValue?: DateType | null;
  value?: DateType | null;
  onChange?: (date: DateType) => void;
  onCalendarChange?: (date: DateType) => void;

  // Panel control
  defaultPickerValue?: DateType | null;
  pickerValue?: DateType | null;
  onPickerValueChange?: (date: DateType) => void;

  // Mode
  mode?: PanelMode;
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

function PickerPanel<DateType = any>(
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
    defaultValue,
    value,
    onChange,
    onCalendarChange,

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

  // ======================== ShowTime ========================
  const mergedShowTime = useTimeConfig(props);

  // ========================== Now ===========================
  const now = generateConfig.getNow();

  // ========================== Mode ==========================
  const [mergedMode, setMergedMode] = useMergedState<PanelMode>(picker, {
    value: mode,
    postState: (val) => val || 'date',
  });

  // ========================= Value ==========================
  // >>> Real value
  // Interactive with `onChange` event which only trigger when the `mode` is `picker`
  const [mergedValue, setMergedValue] = useMergedState<DateType | null>(defaultValue, {
    value,
    onChange,
  });

  // >>> CalendarValue
  // CalendarValue is a temp value for user operation
  // which will only trigger `onCalendarChange` but not `onChange`
  const [calendarValue, setCalendarValue] = React.useState(mergedValue);
  const updateCalendarValue = (newDate: DateType) => {
    setCalendarValue(newDate);

    onCalendarChange?.(newDate);

    if (mergedMode === picker) {
      setMergedValue(newDate);
    }
  };

  React.useEffect(() => {
    setCalendarValue(mergedValue);
  }, [mergedValue]);

  // >>> PickerValue
  // PickerValue is used to control the current displaying panel
  const [mergedPickerValue, setPickerValue] = useMergedState(
    defaultPickerValue || mergedValue || now,
    {
      value: pickerValue,
      onChange: onPickerValueChange,
    },
  );

  const triggerModeChange = (nextMode: PanelMode, viewDate?: DateType) => {
    setMergedMode(nextMode);

    if (viewDate) {
      setPickerValue(viewDate);
    }

    onPanelChange?.(viewDate || pickerValue, nextMode);
  };

  const onPanelValueChange = (newVal: DateType) => {
    updateCalendarValue(newVal);
    setPickerValue(newVal);

    // Update mode if needed
    if (mergedMode !== picker) {
      const queue: PanelMode[] = ['decade', 'year', 'month'];
      const index = queue.indexOf(mergedMode);
      const nextMode = queue[index + 1];
      if (index >= 0 && nextMode) {
        triggerModeChange(nextMode, newVal);
      } else if (mergedMode === 'month') {
        if (picker === 'date') {
          triggerModeChange('date', newVal);
        } else if (picker === 'week') {
          triggerModeChange('week', newVal);
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
  const componentName = mergedMode === 'date' && mergedShowTime ? 'datetime' : mergedMode;
  const PanelComponent = components[componentName] || DefaultComponents[componentName] || DatePanel;

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
        locale={locale}
        generateConfig={generateConfig}
        // Mode
        onModeChange={triggerModeChange}
        // Value
        pickerValue={mergedPickerValue}
        onPickerValueChange={setPickerValue}
        value={calendarValue}
        onChange={onPanelValueChange}
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
export default RefPanelPicker as <DateType = any>(
  props: PickerPanelProps<DateType> & { ref?: React.Ref<PickerPanelRef> },
) => React.ReactElement;

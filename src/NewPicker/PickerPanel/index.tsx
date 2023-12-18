import classNames from 'classnames';
import { useEvent, useMergedState, warning } from 'rc-util';
import * as React from 'react';
import type {
  CellRender,
  Components,
  InternalMode,
  Locale,
  OnPanelChange,
  PanelMode,
  PickerMode,
  SharedPanelProps,
  SharedTimeProps,
} from '../../interface';
import { isSame } from '../../utils/dateUtil';
import { toArray } from '../../utils/miscUtil';
import useLocale from '../../hooks/useLocale';
import { getTimeConfig } from '../../hooks/useTimeConfig';
import useToggleDates from '../../hooks/useToggleDates';
import PickerContext from '../PickerInput/context';
import useCellRender from '../PickerInput/hooks/useCellRender';
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
    >,
    SharedTimeProps<DateType>,
    Pick<React.HTMLAttributes<HTMLDivElement>, 'tabIndex'> {
  // Style
  prefixCls?: string;

  direction?: 'ltr' | 'rtl';

  // Value
  onSelect?: (date: DateType) => void;

  // Panel control
  defaultPickerValue?: DateType | null;
  pickerValue?: DateType | null;
  onPickerValueChange?: (date: DateType) => void;

  // Mode
  mode?: PanelMode;
  /**
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

  /** @deprecated use cellRender instead of dateRender */
  dateRender?: (currentDate: DateType, today: DateType) => React.ReactNode;
  /** @deprecated use cellRender instead of monthCellRender */
  monthCellRender?: (currentDate: DateType, locale: Locale) => React.ReactNode;

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

export type PickerPanelProps<DateType extends object = any> = BasePickerPanelProps<DateType> & {
  /** multiple selection. Not support time or datetime picker */
  multiple?: boolean;

  defaultValue?: DateType | DateType[] | null;
  value?: DateType | DateType[] | null;
  onChange?: (date: DateType | DateType[]) => void;
};

function PickerPanel<DateType extends object = any>(
  props: PickerPanelProps<DateType>,
  ref: React.Ref<PickerPanelRef>,
) {
  const {
    locale,
    disabledDate,
    generateConfig,

    direction,

    // Style
    prefixCls,
    tabIndex = 0,

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
    dateRender,
    monthCellRender,

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
    // Clean up `[null]`
    const values = toArray(innerValue).filter((val) => val);
    return multiple ? values : values.slice(0, 1);
  }, [innerValue, multiple]);

  // Sync value and only trigger onChange event when changed
  const triggerChange = useEvent((nextValue: DateType[] | null) => {
    setMergedValue(nextValue);

    if (
      onChange &&
      (nextValue === null ||
        mergedValue.length !== nextValue.length ||
        mergedValue.some(
          (ori, index) =>
            !isSame(
              generateConfig,
              locale,
              ori,
              nextValue[index],
              picker === 'date' && mergedShowTime ? 'datetime' : picker,
            ),
        ))
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

  // Both trigger when manually pickerValue or mode change
  const triggerPanelChange = (viewDate?: DateType, nextMode?: PanelMode) => {
    onPanelChange?.(viewDate || pickerValue, nextMode || mergedMode);
  };

  const setPickerValue = (nextPickerValue: DateType, triggerPanelEvent = false) => {
    setInternalPickerValue(nextPickerValue);

    onPickerValueChange?.(nextPickerValue);

    if (triggerPanelEvent) {
      triggerPanelChange(nextPickerValue);
    }
  };

  const triggerModeChange = (nextMode: PanelMode, viewDate?: DateType) => {
    setMergedMode(nextMode);

    if (viewDate) {
      setPickerValue(viewDate);
    }

    triggerPanelChange(viewDate, nextMode);
  };

  const onPanelValueSelect = (nextValue: DateType) => {
    onInternalSelect(nextValue);
    setPickerValue(nextValue);

    // Update mode if needed
    if (mergedMode !== picker) {
      const decadeYearQueue: PanelMode[] = ['decade', 'year'];
      const decadeYearMonthQueue: PanelMode[] = [...decadeYearQueue, 'month'];

      const pickerQueue: Partial<Record<PickerMode, PanelMode[]>> = {
        quarter: [...decadeYearQueue, 'quarter'],
        week: [...decadeYearMonthQueue, 'week'],
        date: [...decadeYearMonthQueue, 'date'],
      };

      const queue = pickerQueue[picker] || decadeYearMonthQueue;
      const index = queue.indexOf(mergedMode);
      const nextMode = queue[index + 1];

      if (nextMode) {
        triggerModeChange(nextMode, nextValue);
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
  // >>> cellRender
  const onInternalCellRender = useCellRender(cellRender, dateRender, monthCellRender);

  // ======================= Components =======================
  const PanelComponent = (components[internalMode] ||
    DefaultComponents[internalMode] ||
    DatePanel) as typeof DatePanel;

  // ======================== Warnings ========================
  if (process.env.NODE_ENV !== 'production') {
    warning(
      !mergedValue || mergedValue.every((val) => generateConfig.isValidate(val)),
      'Invalidate date pass to `value` or `defaultValue`.',
    );
  }

  // ========================= Render =========================
  const panelCls = `${mergedPrefixCls}-panel`;

  return (
    <div
      ref={rootRef}
      tabIndex={tabIndex}
      className={classNames(panelCls, {
        [`${panelCls}-rtl`]: direction === 'rtl',
      })}
    >
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
        onPickerValueChange={(nextPickerValue) => {
          setPickerValue(nextPickerValue, true);
        }}
        value={mergedValue[0]}
        onSelect={onPanelValueSelect}
        values={mergedValue}
        // Render
        cellRender={onInternalCellRender}
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

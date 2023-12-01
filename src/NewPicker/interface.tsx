import type { AlignType } from '@rc-component/trigger';
import type { GenerateConfig } from '../generate';

export type Locale = {
  locale: string;

  // ======================================================
  // ==                      Format                      ==
  // ======================================================

  // ==================== Input Format ====================
  // Input format
  /** @deprecated Please use `fieldDateFormat` instead */
  dateFormat?: string;
  /** Input field formatter like YYYY-MM-DD HH:mm:ss */
  fieldDateTimeFormat?: string;
  /** Input field formatter like YYYY-MM-DD */
  fieldDateFormat?: string;
  /** Input field formatter like HH:mm:ss */
  fieldTimeFormat?: string;
  /** Input field formatter like YYYY-MM */
  fieldMonthFormat?: string;
  /** Input field formatter like YYYY */
  fieldYearFormat?: string;
  /** Input field formatter like wwww-go */
  fieldWeekFormat?: string;
  /** Input field formatter like YYYY-Q */
  fieldQuarterFormat?: string;

  // ===================== Date Panel =====================
  // Header Format
  /** Display month before year in date panel header */
  monthBeforeYear?: boolean;
  /** year format in header panel */
  yearFormat?: string;
  /** month format in header panel */
  monthFormat?: string;

  // Cell format
  /** year format in body panel */
  cellYearFormat?: string;
  /** quarter format in body panel */
  cellQuarterFormat?: string;
  /** @deprecated Please use `cellDateFormat` instead */
  dayFormat?: string;
  /** day format in body panel */
  cellDateFormat?: string;
  /** meridiem format in body panel */
  cellMeridiemFormat?: string;

  // ======================================================
  // ==                       MISC                       ==
  // ======================================================
  today: string;
  now: string;
  backToToday: string;
  ok: string;
  timeSelect: string;
  dateSelect: string;
  weekSelect?: string;
  clear: string;
  month: string;
  year: string;
  previousMonth: string;
  nextMonth: string;
  monthSelect: string;
  yearSelect: string;
  decadeSelect: string;

  previousYear: string;
  nextYear: string;
  previousDecade: string;
  nextDecade: string;
  previousCentury: string;
  nextCentury: string;

  shortWeekDays?: string[];
  shortMonths?: string[];
};

export type PanelMode = 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year' | 'decade';

export type InternalMode = PanelMode | 'datetime';

export type PickerMode = Exclude<PanelMode, 'datetime' | 'decade'>;

export type DisabledDate<DateType = any> = (
  date: DateType,
  info: {
    type: PanelMode;
  },
) => boolean;

export interface BaseInfo {
  range?: 'start' | 'end';
}

export interface CellRenderInfo<DateType> extends BaseInfo {
  prefixCls: string;
  // The cell wrapper element
  originNode: React.ReactElement;
  today: DateType;
  type: PanelMode;
  locale?: Locale;
  subType?: 'hour' | 'minute' | 'second' | 'millisecond' | 'meridiem';
}

export type CellRender<DateType, CurrentType = DateType | number> = (
  current: CurrentType,
  info: CellRenderInfo<DateType>,
) => React.ReactNode;

export interface ValueDate<DateType = any> {
  label: React.ReactNode;
  value: DateType | (() => DateType);
}

// ========================== Time ==========================
export interface DisabledTimes {
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
  disabledMilliSeconds?: (hour: number, minute: number, second: number) => number[];
}

export interface SharedTimeProps<DateType = any> {
  /** Only work in picker is `time` */
  format?: string;
  /** Only work in picker is `time` */
  showNow?: boolean;
  /** Only work in picker is `time` */
  showHour?: boolean;
  /** Only work in picker is `time` */
  showMinute?: boolean;
  /** Only work in picker is `time` */
  showSecond?: boolean;
  /** Only work in picker is `time` */
  showMillisecond?: boolean;
  /** Only work in picker is `time` */
  use12Hours?: boolean;
  /** Only work in picker is `time` */
  hourStep?: IntRange<1, 23>;
  /** Only work in picker is `time` */
  minuteStep?: IntRange<1, 59>;
  /** Only work in picker is `time` */
  secondStep?: IntRange<1, 59>;
  /**
   * Only work in picker is `time`.
   * Note that too small step will cause performance issue.
   */
  millisecondStep?: IntRange<1, 999>;
  /** Only work in picker is `time` */
  hideDisabledOptions?: boolean;

  /** Set default value template when empty selection */
  defaultValue?: DateType;

  /** @deprecated Please use `disabledTime` instead. */
  disabledHours?: DisabledTimes['disabledHours'];
  /** @deprecated Please use `disabledTime` instead. */
  disabledMinutes?: DisabledTimes['disabledMinutes'];
  /** @deprecated Please use `disabledTime` instead. */
  disabledSeconds?: DisabledTimes['disabledSeconds'];

  /** Only work in picker is `time` */
  disabledTime?: (date: DateType) => DisabledTimes;

  /** Only work in picker is `time` */
  changeOnScroll?: boolean;
}

export type RangeTimeProps<DateType = any> = Omit<SharedTimeProps<DateType>, 'defaultValue'> & {
  defaultValue?: [DateType, DateType];
};

// ======================= Components =======================
export type OnPanelChange<DateType> = (value: DateType, mode: PanelMode) => void;

export type LimitDate<DateType extends object = any> =
  | DateType
  | ((info: {
      /**
       * Tell the first date user selected on this range selection.
       * This is not care about what field user click.
       */
      from?: DateType;
    }) => DateType);

export interface SharedPanelProps<DateType = any> {
  // Style
  prefixCls: string;

  // Date Library
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;

  // Value
  pickerValue: DateType;
  onPickerValueChange: (date: DateType) => void;
  value?: DateType;
  onChange: (date: DateType) => void;

  // Mode
  onModeChange: (mode: PanelMode, date?: DateType) => void;

  // Render
  disabledDate?: DisabledDate<DateType>;
  minDate?: DateType;
  maxDate?: DateType;
  cellRender?: CellRender<DateType>;

  // Hover
  /** @private Only used for RangePicker passing. */
  hoverValue: [start: DateType, end: DateType] | null;
  onHover?: (value: DateType | null) => void;

  // Time
  /**
   * Only used for `date` mode.
   */
  showTime?: SharedTimeProps<DateType>;

  // Week
  /**
   * Only used for `date` mode.
   */
  showWeek?: boolean;
}

export type Components<DateType = any> = Partial<
  Record<InternalMode, React.ComponentType<SharedPanelProps<DateType>>> & {
    button?: React.ComponentType<any> | string;
    input?: React.ComponentType<any> | string;
  }
>;

// ========================= Picker =========================
export type SemanticStructure = 'popup';

export type CustomFormat<DateType> = (value: DateType) => string;

export type FormatType<DateType = any> = string | CustomFormat<DateType>;

export type SharedHTMLAttrs = Omit<
  React.InputHTMLAttributes<HTMLDivElement>,
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'placeholder'
  | 'id'
  | 'onInvalid'
  | 'disabled'
  | 'onFocus'
  | 'onBlur'
>;

export type PickerFocusEventHandler = (e: React.FocusEvent<HTMLElement>, info: BaseInfo) => void;

export interface SharedPickerProps<DateType = any> extends SharedHTMLAttrs {
  // MISC
  direction?: 'ltr' | 'rtl';

  // Styles
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;

  styles?: Partial<Record<SemanticStructure, React.CSSProperties>>;
  classNames?: Partial<Record<SemanticStructure, string>>;

  // Config
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;

  // Picker
  picker?: PickerMode;
  /** Only work when picker is `date` or `time` */
  showTime?: boolean | SharedTimeProps<DateType>;
  /** Only work when picker is `date` */
  showWeek?: boolean;
  /**
   * Config the input field parse and format.
   * When set `format.align`, it will force user input align with your input,
   * it's only support basic format mask: YYYY, MM, DD, HH, mm, ss, SSS.
   * Once use config mode, it must be fill with format your config.
   */
  format?:
    | FormatType<DateType>
    | FormatType<DateType>[]
    | {
        format: string;
        align?: boolean;
      };
  /**
   * When user input invalidate date, keep it in the input field.
   * This is only used for strong a11y requirement which do not want modify after blur.
   */
  preserveInvalidOnBlur?: boolean;

  // Icons
  suffixIcon?: React.ReactNode;
  allowClear?:
    | boolean
    | {
        clearIcon?: React.ReactNode;
      };

  /** @deprecated Please use `allowClear.clearIcon` instead */
  clearIcon?: React.ReactNode;

  // Active
  onFocus?: PickerFocusEventHandler;
  onBlur?: PickerFocusEventHandler;

  inputReadOnly?: boolean;

  // Disabled
  disabledDate?: DisabledDate<DateType>;
  minDate?: LimitDate<DateType>;
  maxDate?: LimitDate<DateType>;

  // Open
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  popupAlign?: AlignType;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;

  /**
   * By default. Only `time` or `datetime` show the confirm button in panel.
   * `true` to make every picker need confirm.
   * `false` to trigger change on every time panel closed by the mode = picker.
   */
  needConfirm?: boolean;

  // Motion
  transitionName?: string;

  // Render
  components?: Components;
  cellRender?: CellRender<DateType>;
  /** @deprecated use cellRender instead of dateRender */
  dateRender?: (currentDate: DateType, today: DateType) => React.ReactNode;
  /** @deprecated use cellRender instead of monthCellRender */
  monthCellRender?: (currentDate: DateType, locale: Locale) => React.ReactNode;
  /**
   * When use `date` picker,
   * Show the button to set current datetime.
   */
  showNow?: boolean;
  /** @deprecated Please use `showNow` instead */
  showToday?: boolean;
  panelRender?: (originPanel: React.ReactNode) => React.ReactNode;
  renderExtraFooter?: (mode: PanelMode) => React.ReactNode;

  // Events
  onOk?: VoidFunction;
}

export interface PickerRef {
  nativeElement: HTMLDivElement;
  focus: VoidFunction;
  blur: VoidFunction;
}

// ======================== Selector ========================
export interface OpenConfig {
  index?: number;
  /**
   * Keep open if prev state is open but set close within the same frame.
   * This is used for RangePicker input switch to another one.
   */
  inherit?: boolean;
  /**
   * By default. Close popup will delay for one frame. `force` will trigger immediately.
   */
  force?: boolean;
}

export type OnOpenChange = (open: boolean, config?: OpenConfig) => void;
export interface SelectorProps<DateType = any> extends SharedHTMLAttrs {
  clearIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  activeIndex: number | null;
  /** Add `-placeholder` className as a help info */
  activeHelp?: boolean;
  focused: boolean;
  onFocus: (event: React.FocusEvent<HTMLInputElement>, index?: number) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>, index?: number) => void;
  /** Trigger by `enter` key */
  onSubmit: VoidFunction;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;

  // Direction
  direction?: 'ltr' | 'rtl';

  // Click
  onClick: React.MouseEventHandler<HTMLDivElement>;

  // Clear
  onClear: VoidFunction;

  // Change
  format: FormatType<DateType>[];
  /**
   * Convert with user typing for the format template.
   * This will force align the input with template mask.
   */
  maskFormat?: string;
  onChange: (date: DateType, index?: number) => void;
  onInputChange: VoidFunction;
  /** When user input invalidate date, keep it in the input field */
  preserveInvalidOnBlur?: boolean;

  // Open
  /** Open index */
  open: number;
  /** Trigger when need open by selector */
  onOpenChange: OnOpenChange;

  // Invalidate
  inputReadOnly?: boolean;
}

export interface SelectorRef {
  nativeElement: HTMLDivElement;
  focus: (index?: number) => void;
  blur: VoidFunction;
}

// ========================== MISC ==========================
// https://stackoverflow.com/a/39495173; need TypeScript >= 4.5
type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

export type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;

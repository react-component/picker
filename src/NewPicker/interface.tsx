import type { AlignType } from '@rc-component/trigger';
import type { GenerateConfig } from '../generate';

export type Locale = {
  locale: string;

  // ===================== Date Panel =====================
  // Header Format
  /** Display month before year in date panel header */
  monthBeforeYear?: boolean;
  /** year format in header panel */
  yearFormat: string;
  /** month format in header panel */
  monthFormat?: string;
  /** quarter format in header panel */
  quarterFormat?: string;

  // Cell format
  /** year format in body panel */
  yearCellFormat?: string;
  /** day format in body panel */
  dayFormat: string;
  /** meridiem format in body panel */
  meridiemFormat?: string;

  // Column desc
  hour?: string;
  minute?: string;
  second?: string;
  millisecond?: string;
  meridiem?: string;

  // Input format
  /** Input field formatter like YYYY-MM-DD HH:mm:ss */
  fieldDateTimeFormat: string;
  /** Input field formatter like YYYY-MM-DD */
  fieldDateFormat: string;
  /** Input field formatter like YYYY-MM */
  fieldMonthFormat: string;
  /** Input field formatter like YYYY */
  fieldYearFormat: string;
  /** Input field formatter like HH:mm:ss */
  fieldTimeFormat: string;

  // >>>>> Not used yet

  // Input format
  /** Full date format like YYYY-MM-DD in input */
  dateFormat: string;

  /** Full date format with time like YYYY-MM-DD HH:mm:ss in input */
  dateTimeFormat: string;

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

export type DisabledDate<DateType = any> = (
  date: DateType,
  info: {
    type: PanelMode;
  },
) => boolean;

export type CellRenderInfo<DateType> = {
  prefixCls: string;
  // The cell wrapper element
  originNode: React.ReactElement;
  today: DateType;
  // mask current cell as start or end when range picker
  range?: 'start' | 'end';
  type: PanelMode;
  locale?: Locale;
  subType?: 'hour' | 'minute' | 'second' | 'meridiem';
};

export type CellRender<DateType, CurrentType = DateType | number> = (
  current: CurrentType,
  info: CellRenderInfo<DateType>,
) => React.ReactNode;

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
  showTitle?: boolean;
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

// ======================= Components =======================
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
  onModeChange: (mode: PanelMode) => void;

  // Render
  disabledDate?: DisabledDate<DateType>;
  cellRender?: CellRender<DateType>;
  onHover: (value: DateType | null) => void;

  // Time
  showTime?: SharedTimeProps<DateType>;
}

export type Components<DateType = any> = Partial<
  Record<InternalMode, React.ComponentType<SharedPanelProps<DateType>>> & {
    button?: React.ComponentType<any> | string;
  }
>;

// ========================= Picker =========================
export type SemanticStructure = 'popup';

export interface SharedPickerProps<DateType = any> {
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
  mode?: PanelMode;
  onModeChange?: (mode: PanelMode) => void;
  picker?: PanelMode;
  showTime?: SharedTimeProps<DateType>;
  /**
   * Config the input field parse and format.
   * When set `format.align`, it will force user input align with your input,
   * it's only support basic format mask: YYYY, MM, DD, HH, mm, ss, SSS.
   */
  format?:
    | string
    | string[]
    | {
        format: string;
        align?: boolean;
      };
  /** When user input invalidate date, keep it in the input field */
  preserveInvalidOnBlur?: boolean;

  // Icons
  suffixIcon?: React.ReactNode;
  allowClear?:
    | boolean
    | {
        clearIcon?: React.ReactNode;
      };

  // Active
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;

  // Disabled
  disabledDate?: DisabledDate<DateType>;

  // Open
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  popupAlign?: AlignType;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  /**
   * Trigger change event when click outside panel to blur.
   * This is only affect `datetime` & `time` picker
   * which do not have certain end action on the panel cell so need confirm button.
   */
  changeOnBlur?: boolean;

  // Motion
  transitionName?: string;

  // Render
  components?: Components;
  /**
   * When use `date` picker,
   * Show the button to set current datetime.
   */
  showNow?: boolean;
  /** @deprecated Please use `showNow` instead */
  showToday?: boolean;
  panelRender?: (originPanel: React.ReactNode) => React.ReactNode;
  renderExtraFooter?: (mode: PanelMode) => React.ReactNode;
}

export interface PickerRef {
  nativeElement: HTMLDivElement;
  focus: VoidFunction;
  blur: VoidFunction;
}

// ======================== Selector ========================
export interface OpenConfig {
  /**
   * Keep open if prev state is open but set close within the same frame.
   * This is used for RangePicker input switch to another one.
   */
  inherit?: boolean;
}

export type OnOpenChange = (open: boolean, index?: number, config?: OpenConfig) => void;
export interface SelectorProps<DateType = any> {
  suffixIcon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  activeIndex: number | null;
  onFocus: (event: React.FocusEvent<HTMLInputElement>, index?: number) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>, index?: number) => void;
  /** Trigger by `enter` key */
  onSubmit: VoidFunction;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;

  // Click
  onClick: React.MouseEventHandler<HTMLDivElement>;

  // Change
  format: string[];
  /**
   * Convert with user typing for the format template.
   * This will force align the input with template mask.
   */
  maskFormat?: string;
  onChange: (date: DateType, index?: number) => void;
  /** When user input invalidate date, keep it in the input field */
  preserveInvalidOnBlur?: boolean;

  // Open
  /** Open index */
  open: number;
  /** Trigger when need open by selector */
  onOpenChange: OnOpenChange;
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

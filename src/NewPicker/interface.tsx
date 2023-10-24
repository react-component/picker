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
}

export type Components<DateType = any> = Partial<
  Record<PanelMode, React.ComponentType<SharedPanelProps<DateType>>>
>;

// ========================= Picker =========================
export type SemanticStructure = 'popup';

export interface SharedPickerProps {
  // MISC
  direction?: 'ltr' | 'rtl';

  // Styles
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;

  styles?: Partial<Record<SemanticStructure, React.CSSProperties>>;
  classNames?: Partial<Record<SemanticStructure, string>>;

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

  // Open
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  popupAlign?: AlignType;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;

  // Motion
  transitionName?: string;
}

export interface PickerRef {
  nativeElement: HTMLDivElement;
  focus: VoidFunction;
  blur: VoidFunction;
}

// ======================== Selector ========================
export interface SelectorProps {
  suffixIcon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  focused: boolean;
  onFocus: React.FocusEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
}

export interface SelectorRef {
  nativeElement: HTMLDivElement;
  focus: VoidFunction;
  blur: VoidFunction;
}

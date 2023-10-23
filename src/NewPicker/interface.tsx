import type { AlignType } from '@rc-component/trigger';

export type Locale = {
  locale: string;

  // ===================== Date Panel =====================
  /** Display month before year in date panel header */
  monthBeforeYear?: boolean;
  yearFormat: string;
  monthFormat?: string;
  quarterFormat?: string;

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

  dayFormat: string;
  dateFormat: string;
  dateTimeFormat: string;
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
export type Components = Partial<Record<PanelMode, any>>;

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

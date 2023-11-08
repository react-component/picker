import React from 'react';
import type { GenerateConfig } from '../../generate';
import type { CellRender, DisabledDate, Locale, PanelMode, SharedPanelProps } from '../interface';

export interface PanelProps<DateType = any> {
  type: PanelMode;

  // Shared
  prefixCls: string;
  now: DateType;
  disabledDate?: DisabledDate<DateType>;
  cellRender?: CellRender<DateType>;
  onChange: (date: DateType) => void;
  locale: Locale;
  hoverValue: [DateType, DateType] | null;
  onHover?: (date: DateType | null) => void;
  value?: DateType;
  pickerValue?: DateType;
  generateConfig: GenerateConfig<DateType>;
}

/** Used for each single Panel. e.g. DatePanel */
export const PanelContext = React.createContext<PanelProps>(null!);

/**
 * Get shared props for the SharedPanelProps interface.
 */
export function useInfo<DateType = any>(
  props: SharedPanelProps<DateType>,
): [sharedProps: Omit<PanelProps<DateType>, 'type'>, now: DateType] {
  const {
    prefixCls,
    generateConfig,
    locale,
    disabledDate,
    cellRender,
    onChange,
    hoverValue,
    onHover,
    value,
    pickerValue,
  } = props;

  const now = generateConfig.getNow();
  const info = {
    now,
    value,
    pickerValue,
    prefixCls,
    disabledDate,
    cellRender,
    onChange,
    hoverValue,
    onHover,
    locale,
    generateConfig,
  };

  return [info, now];
}

// ============================== Internal ==============================
export interface PickerHackContextProps {
  hidePrev?: boolean;
  hideNext?: boolean;
}

/**
 * Internal usage for RangePicker to not to show the operation arrow
 */
export const PickerHackContext = React.createContext<PickerHackContextProps>({});

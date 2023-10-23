import React from 'react';
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
  onHover: (date: DateType | null) => void;
}

/** Used for each single Panel. e.g. DatePanel */
export const PanelContext = React.createContext<PanelProps>(null!);

/**
 * Get shared props for the SharedPanelProps interface.
 */
export function useInfo<DateType = any>(
  props: SharedPanelProps<DateType>,
): [sharedProps: Omit<PanelProps<DateType>, 'type'>, now: DateType] {
  const { prefixCls, generateConfig, locale, disabledDate, cellRender, onChange, onHover } = props;

  const now = generateConfig.getNow();
  const info = {
    now,
    prefixCls,
    disabledDate,
    cellRender,
    onChange,
    onHover,
    locale,
  };

  return [info, now];
}

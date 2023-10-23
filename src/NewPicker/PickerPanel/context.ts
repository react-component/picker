import React from 'react';
import type { CellRender, DisabledDate, PanelMode, SharedPanelProps } from '../interface';

export interface PanelProps<DateType = any> {
  type: PanelMode;

  // Shared
  now: DateType;
  disabledDate?: DisabledDate<DateType>;
  cellRender?: CellRender<DateType>;
  onChange: (date: DateType) => void;
}

/** Used for each single Panel. e.g. DatePanel */
export const PanelContext = React.createContext<PanelProps>(null!);

/**
 * Get shared props for the SharedPanelProps interface.
 */
export function useInfo<DateType = any>(
  props: SharedPanelProps<DateType>,
): [sharedProps: Omit<PanelProps<DateType>, 'type'>, now: DateType] {
  const { generateConfig, disabledDate, cellRender, onChange } = props;

  const now = generateConfig.getNow();
  const info = { disabledDate, cellRender, onChange, now };

  return [info, now];
}

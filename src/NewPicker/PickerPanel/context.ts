import React from 'react';
import type { CellRender, DisabledDate, PanelMode, SharedPanelProps } from '../interface';

export interface PanelInfoProps<DateType = any> {
  type: PanelMode;

  // Shared
  now: DateType;
  disabledDate?: DisabledDate<DateType>;
  cellRender?: CellRender<DateType>;
}

/** Used for each single Panel. e.g. DatePanel */
export const PanelInfoContext = React.createContext<PanelInfoProps>(null!);

/**
 * Get shared props for the SharedPanelProps interface.
 */
export function useInfo<DateType = any>(
  props: SharedPanelProps<DateType>,
): [sharedProps: Omit<PanelInfoProps<DateType>, 'type'>, now: DateType] {
  const { generateConfig, disabledDate, cellRender } = props;

  const now = generateConfig.getNow();
  const info = { disabledDate, cellRender, now };

  return [info, now];
}

import React from 'react';
import type { CellRender, DisabledDate, PanelMode } from '../interface';

export interface PanelContextProps<DateType = any> {
  disabledDate?: DisabledDate<DateType>;
  value?: DateType;
  pickerValue: DateType;
  cellRender?: CellRender<DateType>;
}

/** Used for root PickerPanel */
export const PanelContext = React.createContext<PanelContextProps>(null!);

export interface PanelInfoProps<DateType = any> {
  type: PanelMode;
  now: DateType;
}

/** Used for each single Panel. e.g. DatePanel */
export const PanelInfoContext = React.createContext<PanelInfoProps>(null!);

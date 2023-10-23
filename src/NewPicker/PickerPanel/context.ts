import React from 'react';
import type { GenerateConfig } from '../../generate';
import type { CellRender, DisabledDate, Locale, PanelMode } from '../interface';

export interface PanelContextProps<DateType = any> {
  locale: Locale;
  disabledDate?: DisabledDate<DateType>;
  generateConfig: GenerateConfig<DateType>;
  pickerValue: DateType;
  cellRender?: CellRender<DateType>;
}

/** Used for root PickerPanel */
export const PanelContext = React.createContext<PanelContextProps>(null!);

export interface PanelInfoProps {
  type: PanelMode;
}

/** Used for each single Panel. e.g. DatePanel */
export const PanelInfoContext = React.createContext<PanelInfoProps>(null!);

import * as React from 'react';
import type { PanelMode, SharedPanelProps } from '../../interface';

export interface PanelContextProps<DateType extends object = any>
  extends Pick<
    SharedPanelProps<DateType>,
    | 'prefixCls'
    | 'disabledDate'
    | 'cellRender'
    | 'generateConfig'
    | 'locale'
    | 'onSelect'
    | 'hoverValue'
    | 'onHover'
    | 'values'
    | 'pickerValue'
  > {
  /** Tell current panel type */
  panelType: PanelMode;

  // Shared
  now: DateType;
}

/** Used for each single Panel. e.g. DatePanel */
export const PanelContext = React.createContext<PanelContextProps>(null!);

export function usePanelContext<DateType extends object = any>(): PanelContextProps<DateType> {
  return React.useContext<PanelContextProps<DateType>>(PanelContext);
}

/**
 * Get shared props for the SharedPanelProps interface.
 */
export function useInfo<DateType extends object = any>(
  props: SharedPanelProps<DateType>,
  panelType: PanelMode,
): [sharedProps: PanelContextProps<DateType>, now: DateType] {
  const {
    prefixCls,
    generateConfig,
    locale,
    disabledDate,
    cellRender,
    hoverValue,
    onHover,
    values,
    pickerValue,
    onSelect,
  } = props;

  // ========================= MISC =========================
  const now = generateConfig.getNow();

  // ========================= Info =========================
  const info = {
    now,
    values,
    pickerValue,
    prefixCls,
    disabledDate,
    cellRender,
    hoverValue,
    onHover,
    locale,
    generateConfig,
    onSelect,
    panelType,
  };

  return [info, now];
}

// ============================== Internal ==============================
export interface PickerHackContextProps {
  hidePrev?: boolean;
  hideNext?: boolean;
  onCellDblClick?: () => void;
}

/**
 * Internal usage for RangePicker to not to show the operation arrow
 */
export const PickerHackContext = React.createContext<PickerHackContextProps>({});

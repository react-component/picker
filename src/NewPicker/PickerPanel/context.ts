import React from 'react';
import type { InternalMode, PanelMode, SharedPanelProps } from '../interface';

export interface PanelContextProps<DateType = any>
  extends Pick<
    SharedPanelProps,
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
  /** Tell the current picker type. Includes 'datetime' */
  internalPicker: InternalMode;

  // Shared
  now: DateType;
}

/** Used for each single Panel. e.g. DatePanel */
export const PanelContext = React.createContext<PanelContextProps>(null!);

/**
 * Get shared props for the SharedPanelProps interface.
 */
export function useInfo<DateType = any>(
  props: SharedPanelProps<DateType>,
  panelType: PanelMode,
  internalPicker: InternalMode,
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
    internalPicker,
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

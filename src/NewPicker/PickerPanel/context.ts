import { useEvent } from 'rc-util';
import React from 'react';
import useToggleDates from '../hooks/useToggleDates';
import type { InternalMode, PanelMode, SharedPanelProps } from '../interface';

export interface PanelContextProps<DateType = any>
  extends Pick<
    SharedPanelProps,
    | 'prefixCls'
    | 'disabledDate'
    | 'cellRender'
    | 'generateConfig'
    | 'locale'
    // | 'onChange'
    | 'onValuesChange'
    | 'hoverValue'
    | 'onHover'
    // | 'value'
    | 'values'
    | 'pickerValue'
  > {
  /** Tell current panel type */
  panelType: PanelMode;
  /** Tell the current picker type. Includes 'datetime' */
  internalPicker: InternalMode;

  // Shared
  now: DateType;
  toggleDate: (date: DateType) => void;
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
    // onChange,
    onValuesChange,
    hoverValue,
    onHover,
    // value,
    values,
    pickerValue,
    multiple,
  } = props;

  // ========================= MISC =========================
  const now = generateConfig.getNow();

  // ======================== Toggle ========================
  const toggleDates = useToggleDates(generateConfig, locale, internalPicker);
  const toggleDate = useEvent((date: DateType) => {
    const nextValues = multiple ? toggleDates(values, date) : [date];
    onValuesChange(nextValues);
  });

  // ========================= Info =========================
  const info = {
    now,
    // value,
    values,
    pickerValue,
    prefixCls,
    disabledDate,
    cellRender,
    // onChange,
    onValuesChange,
    hoverValue,
    onHover,
    locale,
    generateConfig,
    toggleDate,
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

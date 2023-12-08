import React from 'react';
import type { PanelMode, SharedPanelProps } from '../interface';

export interface PanelContextProps<DateType = any>
  extends Pick<
    SharedPanelProps,
    | 'prefixCls'
    | 'disabledDate'
    | 'cellRender'
    | 'generateConfig'
    | 'locale'
    | 'onChange'
    | 'onValuesChange'
    | 'hoverValue'
    | 'onHover'
    | 'value'
    | 'values'
    | 'pickerValue'
  > {
  type: PanelMode;

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
): [sharedProps: Omit<PanelContextProps<DateType>, 'type'>, now: DateType] {
  const {
    prefixCls,
    generateConfig,
    locale,
    disabledDate,
    cellRender,
    onChange,
    onValuesChange,
    hoverValue,
    onHover,
    value,
    values,
    pickerValue,
  } = props;

  const now = generateConfig.getNow();
  const info = {
    now,
    value,
    values,
    pickerValue,
    prefixCls,
    disabledDate,
    cellRender,
    onChange,
    onValuesChange,
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
  onCellDblClick?: () => void;
}

/**
 * Internal usage for RangePicker to not to show the operation arrow
 */
export const PickerHackContext = React.createContext<PickerHackContextProps>({});

import * as React from 'react';
import type { PanelMode, SharedPanelProps } from '../interface';

export interface PanelContextProps<DateType extends object = any>
  extends Pick<
    SharedPanelProps<DateType>,
    | 'prefixCls'
    | 'cellRender'
    | 'generateConfig'
    | 'locale'
    | 'onSelect'
    | 'hoverValue'
    | 'hoverRangeValue'
    | 'onHover'
    | 'values'
    | 'pickerValue'

    // Limitation
    | 'disabledDate'
    | 'minDate'
    | 'maxDate'

    // Icon
    | 'prevIcon'
    | 'nextIcon'
    | 'superPrevIcon'
    | 'superNextIcon'
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
    minDate,
    maxDate,
    cellRender,
    hoverValue,
    hoverRangeValue,
    onHover,
    values,
    pickerValue,
    onSelect,

    // Icons
    prevIcon,
    nextIcon,
    superPrevIcon,
    superNextIcon,
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
    minDate,
    maxDate,
    cellRender,
    hoverValue,
    hoverRangeValue,
    onHover,
    locale,
    generateConfig,
    onSelect,
    panelType,

    // Icons
    prevIcon,
    nextIcon,
    superPrevIcon,
    superNextIcon,
  };

  return [info, now];
}

// ============================== Internal ==============================
export interface PickerHackContextProps {
  hidePrev?: boolean;
  hideNext?: boolean;
  hideHeader?: boolean;
  onCellDblClick?: () => void;
}

/**
 * Internal usage for RangePicker to not to show the operation arrow
 */
export const PickerHackContext = React.createContext<PickerHackContextProps>({});

if (process.env.NODE_ENV !== 'production') {
  PickerHackContext.displayName = 'PickerHackContext';
}

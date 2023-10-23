import { useMergedState } from 'rc-util';
import * as React from 'react';
import type { GenerateConfig } from '../../generate';
import type { CellRender, DisabledDate, Locale } from '../interface';
import { PrefixClsContext } from '../PickerInput/context';
import { PanelContext, type PanelContextProps } from './context';
import DatePanel from './DatePanel';

export interface PickerPanelProps<DateType = any> {
  locale: Locale;
  disabledDate?: DisabledDate<DateType>;
  generateConfig: GenerateConfig<DateType>;

  // Panel control
  defaultPickerValue?: DateType | null;
  pickerValue?: DateType | null;
  onPickerValueChange?: (date: DateType) => void;

  // Cell
  cellRender?: CellRender<DateType>;
}

export default function PickerPanel<DateType = any>(props: PickerPanelProps<DateType>) {
  const {
    locale,
    disabledDate,
    generateConfig,

    // Picker control
    defaultPickerValue,
    pickerValue,
    onPickerValueChange,

    // Cell
    cellRender,
  } = props;

  const prefixCls = React.useContext(PrefixClsContext);

  // ====================== PickerValue =======================
  // PickerValue is used to control the current displaying panel
  const [mergedPickerValue, setPickerValue] = useMergedState(
    defaultPickerValue || generateConfig.getNow(),
    {
      value: pickerValue,
      onChange: onPickerValueChange,
    },
  );

  // ======================== Context =========================
  const panelContext = React.useMemo<PanelContextProps>(
    () => ({
      locale,
      disabledDate,
      generateConfig,
      pickerValue: mergedPickerValue,
      cellRender,
    }),
    [locale, disabledDate, generateConfig, mergedPickerValue, cellRender],
  );

  // ========================= Render =========================
  return (
    <PanelContext.Provider value={panelContext}>
      <DatePanel />
    </PanelContext.Provider>
  );
}

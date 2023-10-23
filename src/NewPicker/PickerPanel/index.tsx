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

  // Value
  defaultValue?: DateType | null;
  value?: DateType | null;

  // Panel control
  defaultPickerValue?: DateType | null;
  pickerValue?: DateType | null;
  onPickerValueChange?: (date: DateType) => void;

  // Cell
  cellRender?: CellRender<DateType>;

  // Components
}

export default function PickerPanel<DateType = any>(props: PickerPanelProps<DateType>) {
  const {
    locale,
    disabledDate,
    generateConfig,

    // Value
    defaultValue,
    value,

    // Picker control
    defaultPickerValue,
    pickerValue,
    onPickerValueChange,

    // Cell
    cellRender,
  } = props;

  const prefixCls = React.useContext(PrefixClsContext);

  // ========================== Now ===========================
  const now = generateConfig.getNow();

  // ========================= Value ==========================
  const [mergedValue, setMergedValue] = useMergedState<DateType | null>(defaultValue, {
    value,
  });

  // ====================== PickerValue =======================
  // PickerValue is used to control the current displaying panel
  const [mergedPickerValue, setPickerValue] = useMergedState(
    defaultPickerValue || mergedValue || now,
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
      value: mergedValue,
      pickerValue: mergedPickerValue,
      cellRender,
      now,
    }),
    [locale, disabledDate, generateConfig, mergedValue, mergedPickerValue, cellRender, now],
  );

  // ========================= Render =========================
  return (
    <PanelContext.Provider value={panelContext}>
      <DatePanel />
    </PanelContext.Provider>
  );
}

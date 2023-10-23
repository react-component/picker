import { useMergedState } from 'rc-util';
import * as React from 'react';
import type { GenerateConfig } from '../../generate';
import type { CellRender, Components, DisabledDate, Locale, PanelMode } from '../interface';
import { PrefixClsContext } from '../PickerInput/context';
import DatePanel from './DatePanel';

const DefaultComponents: Components = {
  date: DatePanel,
};

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

  // Mode
  mode?: PanelMode;
  picker?: PanelMode;

  // Cell
  cellRender?: CellRender<DateType>;

  // Components
  components?: Components;
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

    // Mode
    mode,
    picker = 'date',

    // Cell
    cellRender,

    // Components
    components = {},
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

  // ========================== Mode ==========================
  const [mergedMode, setMergedMode] = useMergedState<PanelMode>(picker, {
    value: mode,
    postState: (val) => val || 'date',
  });

  // ======================= Components =======================
  const PanelComponent = components[mergedMode] || DefaultComponents[mergedMode];

  // ========================= Render =========================
  return (
    <PanelComponent
      prefixCls={prefixCls}
      locale={locale}
      generateConfig={generateConfig}
      pickerValue={mergedPickerValue}
      value={mergedValue}
      cellRender={cellRender}
      disabledDate={disabledDate}
    />
  );
}

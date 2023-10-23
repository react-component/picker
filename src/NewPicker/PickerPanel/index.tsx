import { useMergedState } from 'rc-util';
import * as React from 'react';
import type { GenerateConfig } from '../../generate';
import type { CellRender, Components, DisabledDate, Locale, PanelMode } from '../interface';
import { PrefixClsContext } from '../PickerInput/context';
import DatePanel from './DatePanel';
import MonthPanel from './MonthPanel';
import WeekPanel from './WeekPanel';

const DefaultComponents: Components = {
  date: DatePanel,
  week: WeekPanel,
  month: MonthPanel,
};

export interface PickerPanelProps<DateType = any> {
  locale: Locale;
  disabledDate?: DisabledDate<DateType>;
  generateConfig: GenerateConfig<DateType>;

  // Style
  prefixCls?: string;

  // Value
  defaultValue?: DateType | null;
  value?: DateType | null;
  onChange?: (date: DateType) => void;

  // Panel control
  defaultPickerValue?: DateType | null;
  pickerValue?: DateType | null;
  onPickerValueChange?: (date: DateType) => void;

  // Mode
  mode?: PanelMode;
  onModeChange?: (mode: PanelMode) => void;
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

    // Style
    prefixCls,

    // Value
    defaultValue,
    value,
    onChange,

    // Picker control
    defaultPickerValue,
    pickerValue,
    onPickerValueChange,

    // Mode
    mode,
    onModeChange,
    picker = 'date',

    // Cell
    cellRender,

    // Components
    components = {},
  } = props;

  const mergedPrefixCls = React.useContext(PrefixClsContext) || prefixCls || 'rc-picker';

  // ========================== Now ===========================
  const now = generateConfig.getNow();

  // ========================= Value ==========================
  const [mergedValue, setMergedValue] = useMergedState<DateType | null>(defaultValue, {
    value,
  });

  const onInternalChange = (newVal: DateType) => {
    setMergedValue(newVal);
    onChange?.(newVal);
  };

  // ====================== PickerValue =======================
  // PickerValue is used to control the current displaying panel
  const [mergedPickerValue, setPickerValue] = useMergedState(
    defaultPickerValue || mergedValue || now,
    {
      value: pickerValue,
      onChange: onPickerValueChange,
    },
  );

  // ======================= HoverValue =======================
  const [hoverDate, setHoverDate] = React.useState<DateType>(null);

  // ========================== Mode ==========================
  const [mergedMode, setMergedMode] = useMergedState<PanelMode>(picker, {
    value: mode,
    postState: (val) => val || 'date',
    onChange: onModeChange,
  });

  // ======================= Components =======================
  const PanelComponent = components[mergedMode] || DefaultComponents[mergedMode] || DatePanel;

  // ========================= Render =========================
  return (
    <div className={`${mergedPrefixCls}-panel`}>
      <PanelComponent
        prefixCls={mergedPrefixCls}
        locale={locale}
        generateConfig={generateConfig}
        // Mode
        onModeChange={setMergedMode}
        // Value
        pickerValue={mergedPickerValue}
        onPickerValueChange={setPickerValue}
        value={mergedValue}
        onChange={onInternalChange}
        // Render
        cellRender={cellRender}
        disabledDate={disabledDate}
        onHover={setHoverDate}
      />
    </div>
  );
}

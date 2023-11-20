import * as React from 'react';
import PickerPanel, { type PickerPanelProps } from '../../PickerPanel';
import { PickerHackContext } from '../../PickerPanel/context';
import PickerContext from '../context';
import { offsetPanelDate } from '../hooks/useRangePickerValue';
import { type FooterProps } from './Footer';

export type MustProp = Required<Pick<PickerPanelProps, 'mode' | 'onPanelChange'>>;

export type PopupPanelProps<DateType = any> = MustProp &
  PickerPanelProps<DateType> &
  FooterProps<DateType> & {
    multiple?: boolean;
  };

// TODO: `needConfirm` 下，连续点击右边的面板会持续位移，应该只需要在切换 field 时才做位移
export default function PopupPanel<DateType = any>(props: PopupPanelProps<DateType>) {
  const { picker, multiple, pickerValue, onPickerValueChange } = props;
  const { prefixCls, generateConfig } = React.useContext(PickerContext);

  // ======================== Offset ========================
  const internalOffsetDate = React.useCallback(
    (date: DateType, offset: number) => {
      return offsetPanelDate(generateConfig, picker, date, offset);
    },
    [generateConfig, picker],
  );

  const nextPickerValue = React.useMemo(
    () => internalOffsetDate(pickerValue, 1),
    [pickerValue, internalOffsetDate],
  );

  const onNextPickerValueChange = (nextDate: DateType) => {
    onPickerValueChange(internalOffsetDate(nextDate, -1));
  };

  // ======================== Render ========================
  // Multiple
  if (multiple) {
    return (
      <div className={`${prefixCls}-panels`}>
        <PickerHackContext.Provider value={{ hideNext: true }}>
          <PickerPanel {...props} />
        </PickerHackContext.Provider>
        <PickerHackContext.Provider value={{ hidePrev: true }}>
          <PickerPanel
            {...props}
            pickerValue={nextPickerValue}
            onPickerValueChange={onNextPickerValueChange}
          />
        </PickerHackContext.Provider>
      </div>
    );
  }

  // Single
  return <PickerPanel {...props} />;
}

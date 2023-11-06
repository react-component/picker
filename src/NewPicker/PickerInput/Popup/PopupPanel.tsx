import * as React from 'react';
import PickerPanel, { type PickerPanelProps } from '../../PickerPanel';
import PickerContext from '../context';
import { offsetPanelDate } from '../hooks/useRangePickerValue';
import { type FooterProps } from './Footer';

export type MustProp = Required<Pick<PickerPanelProps, 'mode' | 'onModeChange'>>;

export type PopupPanelProps<DateType = any> = MustProp &
  PickerPanelProps<DateType> &
  FooterProps<DateType> & {
    multiple?: boolean;
  };

export default function PopupPanel<DateType = any>(props: PopupPanelProps<DateType>) {
  const { picker, multiple, pickerValue, onPickerValueChange } = props;
  const { prefixCls, generateConfig } = React.useContext(PickerContext);

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
        <PickerPanel {...props} />
        <PickerPanel
          {...props}
          pickerValue={nextPickerValue}
          onPickerValueChange={onNextPickerValueChange}
        />
      </div>
    );
  }

  // Single
  return <PickerPanel {...props} />;
}

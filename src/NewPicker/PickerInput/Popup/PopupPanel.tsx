import * as React from 'react';
import PickerPanel, { type PickerPanelProps } from '../../PickerPanel';
import PickerContext from '../context';
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

  const offsetDate = React.useCallback(
    (date: DateType, offset: number) => {
      switch (picker) {
        case 'date':
          return generateConfig.addMonth(date, offset);

        case 'month':
        case 'quarter':
          return generateConfig.addYear(date, offset);

        case 'year':
          return generateConfig.addYear(date, offset * 10);

        case 'decade':
          return generateConfig.addYear(date, offset * 100);

        default:
          return date;
      }
    },
    [generateConfig, picker],
  );

  const nextPickerValue = React.useMemo(
    () => offsetDate(pickerValue, 1),
    [pickerValue, offsetDate],
  );

  const onNextPickerValueChange = (nextDate: DateType) => {
    onPickerValueChange(offsetDate(nextDate, -1));
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

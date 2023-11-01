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
  const { internalMode, picker, multiple } = props;
  const { prefixCls } = React.useContext(PickerContext);

  console.log('????', internalMode, picker);

  if (multiple) {
    return (
      <div className={`${prefixCls}-panels`}>
        <PickerPanel {...props} />
        <PickerPanel {...props} />
      </div>
    );
  }

  return <PickerPanel {...props} />;
}

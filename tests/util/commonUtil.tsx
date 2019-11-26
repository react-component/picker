import React from 'react';
import { mount as originMount, ReactWrapper } from 'enzyme';
import moment, { Moment, unitOfTime } from 'moment';
import Picker, { PickerProps, PickerPanel, PickerPanelProps } from '../../src';
import momentGenerateConfig from '../../src/generate/moment';
import enUS from '../../src/locale/en_US';

const FULL_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const mount = originMount as (
  ...args: Parameters<typeof originMount>
) => ReactWrapper & {
  openPicker: () => void;
  closePicker: () => void;
  isOpen: () => boolean;
  selectCell: (text: number | string) => void;
  clearValue: () => void;
  keyDown: (which: number, info?: object) => void;
};

export function getMoment(str: string): Moment {
  const formatList = [FULL_FORMAT, 'YYYY-MM-DD'];
  for (let i = 0; i < formatList.length; i += 1) {
    const date = moment(str, formatList[i], true);
    if (date.isValid()) {
      return date;
    }
  }
  throw new Error(`Format not match with: ${str}`);
}

export function isSame(
  date: Moment,
  dateStr: string,
  type: unitOfTime.StartOf = 'date',
) {
  if (date.isSame(getMoment(dateStr), type)) {
    return true;
  }

  throw new Error(
    `${date.format(FULL_FORMAT)} is not same as expected: ${dateStr}`,
  );
}

export interface MomentPickerProps
  extends Omit<PickerProps<Moment>, 'locale' | 'generateConfig'> {
  locale?: PickerProps<Moment>['locale'];
  generateConfig?: PickerProps<Moment>['generateConfig'];
}

export class MomentPicker extends React.Component<MomentPickerProps> {
  pickerRef = React.createRef<Picker<Moment>>();

  render() {
    return (
      <Picker<Moment>
        generateConfig={momentGenerateConfig}
        locale={enUS}
        ref={this.pickerRef}
        {...this.props}
      />
    );
  }
}

export interface MomentPickerPanelProps
  extends Omit<PickerPanelProps<Moment>, 'locale' | 'generateConfig'> {
  locale?: PickerProps<Moment>['locale'];
  generateConfig?: PickerProps<Moment>['generateConfig'];
}

export const MomentPickerPanel = (props: MomentPickerPanelProps) => (
  <PickerPanel<Moment>
    generateConfig={momentGenerateConfig}
    locale={enUS}
    {...props}
  />
);

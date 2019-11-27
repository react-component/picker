import React from 'react';
import { mount as originMount, ReactWrapper } from 'enzyme';
import moment, { Moment, unitOfTime } from 'moment';
import Picker, { PickerProps, PickerPanel } from '../../src';
import momentGenerateConfig from '../../src/generate/moment';
import enUS from '../../src/locale/en_US';
import {
  PickerBaseProps,
  PickerDateProps,
  PickerTimeProps,
} from '../../src/Picker';
import {
  PickerPanelBaseProps,
  PickerPanelDateProps,
  PickerPanelTimeProps,
} from '../../src/PickerPanel';

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

interface MomentDefaultProps {
  locale?: PickerProps<Moment>['locale'];
  generateConfig?: PickerProps<Moment>['generateConfig'];
}

type InjectDefaultProps<Props> = Omit<Props, 'locale' | 'generateConfig'> &
  MomentDefaultProps;

export type MomentPickerProps =
  | InjectDefaultProps<PickerBaseProps<Moment>>
  | InjectDefaultProps<PickerDateProps<Moment>>
  | InjectDefaultProps<PickerTimeProps<Moment>>;

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

export type MomentPickerPanelProps =
  | InjectDefaultProps<PickerPanelBaseProps<Moment>>
  | InjectDefaultProps<PickerPanelDateProps<Moment>>
  | InjectDefaultProps<PickerPanelTimeProps<Moment>>;

export const MomentPickerPanel = (props: MomentPickerPanelProps) => (
  <PickerPanel<Moment>
    generateConfig={momentGenerateConfig}
    locale={enUS}
    {...props}
  />
);

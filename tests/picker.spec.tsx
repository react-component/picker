import React from 'react';
import { mount as originMount, ReactWrapper } from 'enzyme';
import { Moment } from 'moment';
import Picker, { PickerProps } from '../src';
import momentGenerateConfig from '../src/generate/moment';
import enUS from '../src/locale/en_US';
import { PanelMode } from '../src/interface';

const mount = originMount as (
  ...args: Parameters<typeof originMount>
) => ReactWrapper & {
  openPicker: () => void;
  closePicker: () => void;
  isOpen: () => boolean;
};

interface MomentPicker
  extends Omit<PickerProps<Moment>, 'locale' | 'generateConfig'> {
  locale?: PickerProps<Moment>['locale'];
  generateConfig?: PickerProps<Moment>['generateConfig'];
}

const MomentPicker = (props: MomentPicker) => (
  <Picker<Moment>
    generateConfig={momentGenerateConfig}
    locale={enUS}
    {...props}
  />
);

describe('Basic', () => {
  describe('mode', () => {
    const modeList: { mode: PanelMode; componentNames: string[] }[] = [
      {
        mode: 'decade',
        componentNames: ['DecadePanel', 'DecadeHeader', 'DecadeBody'],
      },
      {
        mode: 'year',
        componentNames: ['YearPanel', 'YearHeader', 'YearBody'],
      },
      {
        mode: 'month',
        componentNames: ['MonthPanel', 'MonthHeader', 'MonthBody'],
      },
      {
        mode: 'date',
        componentNames: ['DatePanel', 'DateHeader', 'DateBody'],
      },
      {
        mode: 'datetime',
        componentNames: [
          'DatetimePanel',
          'DateHeader',
          'DateBody',
          'TimeHeader',
          'TimeBody',
        ],
      },
      {
        mode: 'time',
        componentNames: ['TimePanel', 'TimeHeader', 'TimeBody'],
      },
    ];

    modeList.forEach(({ mode, componentNames }) => {
      it(mode, () => {
        const wrapper = mount(<MomentPicker mode={mode} open />);
        componentNames.forEach(componentName => {
          expect(wrapper.find(componentName).length).toBeTruthy();
        });
      });
    });
  });

  describe('open', () => {
    it('should work', () => {
      const wrapper = mount(<MomentPicker />);
      wrapper.openPicker();
      expect(wrapper.isOpen()).toBeTruthy();
      wrapper.closePicker();
      expect(wrapper.isOpen()).toBeFalsy();
    });

    it('controlled', () => {
      const wrapper = mount(<MomentPicker open />);
      expect(wrapper.isOpen()).toBeTruthy();

      wrapper.setProps({ open: false });
      expect(wrapper.isOpen()).toBeFalsy();
    });
  });
});

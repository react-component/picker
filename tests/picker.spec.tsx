import React from 'react';
import { Moment } from 'moment';
import MockDate from 'mockdate';
import KeyCode from 'rc-util/lib/KeyCode';
import Picker, { PickerProps } from '../src';
import momentGenerateConfig from '../src/generate/moment';
import enUS from '../src/locale/en_US';
import { PanelMode } from '../src/interface';
import { mount, getMoment, isSame } from './util/commonUtil';

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
  beforeAll(() => {
    MockDate.set(getMoment('1990-09-03 00:00:00').toDate());
  });

  afterAll(() => {
    MockDate.reset();
  });

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
      const onOpenChange = jest.fn();
      const wrapper = mount(<MomentPicker onOpenChange={onOpenChange} />);

      wrapper.openPicker();
      expect(wrapper.isOpen()).toBeTruthy();
      expect(onOpenChange).toHaveBeenCalledWith(true);
      onOpenChange.mockReset();

      wrapper.closePicker();
      expect(wrapper.isOpen()).toBeFalsy();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('controlled', () => {
      const wrapper = mount(<MomentPicker open />);
      expect(wrapper.isOpen()).toBeTruthy();

      wrapper.setProps({ open: false });
      expect(wrapper.isOpen()).toBeFalsy();
    });

    it('disabled should not open', () => {
      const wrapper = mount(<MomentPicker open disabled />);
      expect(wrapper.isOpen()).toBeFalsy();
    });
  });

  describe('value', () => {
    it('defaultValue', () => {
      const wrapper = mount(
        <MomentPicker defaultValue={getMoment('1989-11-28')} />,
      );
      expect(wrapper.find('input').prop('value')).toEqual('1989-11-28');
    });

    it('uncontrolled', () => {
      const onChange = jest.fn();
      const wrapper = mount(<MomentPicker onChange={onChange} />);
      wrapper.openPicker();
      wrapper.selectDate(11);
      wrapper.closePicker();

      expect(isSame(onChange.mock.calls[0][0], '1990-09-11')).toBeTruthy();
      expect(onChange.mock.calls[0][1]).toEqual('1990-09-11');
      expect(wrapper.find('input').prop('value')).toEqual('1990-09-11');
    });

    it('controlled', () => {
      const onChange = jest.fn();
      const wrapper = mount(
        <MomentPicker value={getMoment('2011-11-11')} onChange={onChange} />,
      );

      wrapper.openPicker();
      wrapper.selectDate(3);
      wrapper.closePicker();
      wrapper.update();

      expect(isSame(onChange.mock.calls[0][0], '2011-11-03')).toBeTruthy();
      expect(wrapper.find('input').prop('value')).toEqual('2011-11-11');

      wrapper.setProps({ value: onChange.mock.calls[0][0] });
      wrapper.update();
      expect(wrapper.find('input').prop('value')).toEqual('2011-11-03');

      // Raw change value
      wrapper.setProps({ value: getMoment('1999-09-09') });
      wrapper.update();
      expect(wrapper.find('input').prop('value')).toEqual('1999-09-09');
    });
  });

  it('typing to change value', () => {
    const onChange = jest.fn();
    const wrapper = mount(<MomentPicker onChange={onChange} allowClear />);
    wrapper.openPicker();
    wrapper.find('input').simulate('focus');
    wrapper.find('input').simulate('change', {
      target: {
        value: '2000-01-01',
      },
    });

    expect(wrapper.find('input').prop('value')).toEqual('2000-01-01');
    expect(onChange).not.toHaveBeenCalled();
    wrapper.find('input').simulate('keyDown', {
      which: KeyCode.ENTER,
    });
    expect(isSame(onChange.mock.calls[0][0], '2000-01-01')).toBeTruthy();
    onChange.mockReset();

    wrapper.clearValue();
    expect(onChange).toHaveBeenCalledWith(null, '');
  });
});

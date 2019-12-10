import React from 'react';
import MockDate from 'mockdate';
import {
  mount,
  getMoment,
  MomentRangePicker,
  MomentPicker,
  MomentPickerPanel,
} from './util/commonUtil';

describe('Picker.Components', () => {
  beforeAll(() => {
    MockDate.set(getMoment('1990-09-03 00:00:00').toDate());
  });

  afterAll(() => {
    MockDate.reset();
  });

  [
    { name: 'RangePicker', component: MomentRangePicker, ranges: true },
    { name: 'Picker', component: MomentPicker },
    { name: 'PickerPanel', component: MomentPickerPanel },
  ].forEach(({ name, component, ranges }) => {
    it(name, () => {
      const Component = component as any;
      const Button: React.FC<any> = props => <h1 {...props} />;
      const Item: React.FC<any> = props => <h2 {...props} />;

      const wrapper = mount(
        <Component
          ranges={{
            good: [null, null],
          }}
          components={{
            button: Button,
            rangeItem: Item,
          }}
          picker="time"
          open
        />,
      );

      expect(wrapper.find('.rc-picker-footer').find('h1')).toHaveLength(1);
      if (ranges) {
        expect(wrapper.find('.rc-picker-footer').find('h2')).toHaveLength(1);
      }
    });
  });
});

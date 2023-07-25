import { render } from '@testing-library/react';
import MockDate from 'mockdate';
import React from 'react';
import { getMoment, MomentPicker, MomentPickerPanel, MomentRangePicker } from './util/commonUtil';

describe('Picker.Components', () => {
  beforeAll(() => {
    MockDate.set(getMoment('1990-09-03 00:00:00').toDate());
  });

  afterAll(() => {
    MockDate.reset();
  });

  [
    { name: 'RangePicker', component: MomentRangePicker },
    { name: 'Picker', component: MomentPicker },
    { name: 'PickerPanel', component: MomentPickerPanel },
  ].forEach(({ name, component }) => {
    it(name, () => {
      const Component = component as any;
      const Button: React.FC<any> = (props) => <h1 {...props} />;
      const Item: React.FC<any> = (props) => <h2 {...props} />;

      render(
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

      expect(document.querySelector('.rc-picker-footer').querySelectorAll('h1')).toHaveLength(1);
    });
  });
});

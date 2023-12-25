import { render } from '@testing-library/react';
import MockDate from 'mockdate';
import React from 'react';
import { DayPicker, DayRangePicker, getDay } from './util/commonUtil';

describe('Picker.Components', () => {
  beforeAll(() => {
    MockDate.set(getDay('1990-09-03 00:00:00').toDate());
  });

  afterAll(() => {
    MockDate.reset();
  });

  [
    { name: 'RangePicker', component: DayRangePicker },
    { name: 'Picker', component: DayPicker },
  ].forEach(({ name, component }) => {
    it(name, () => {
      const Component = component as any;
      const Button: React.FC<any> = (props) => <h1 {...props} />;

      render(
        <Component
          ranges={{
            good: [null, null],
          }}
          components={{
            button: Button,
          }}
          picker="time"
          open
        />,
      );

      expect(document.querySelector('.rc-picker-footer').querySelectorAll('h1')).toHaveLength(1);
    });
  });
});

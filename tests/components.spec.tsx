import { resetWarned } from '@rc-component/util';
import { render } from '@testing-library/react';
import MockDate from 'mockdate';
import React from 'react';
import { DayPicker, DayRangePicker, getDay } from './util/commonUtil';

describe('Picker.Components', () => {
  beforeEach(() => {
    resetWarned();
    jest.clearAllMocks();
  });

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
            okButton: Button,
          }}
          picker="time"
          open
        />,
      );

      expect(document.querySelector('.rc-picker-footer').querySelectorAll('h1')).toHaveLength(1);
    });

    it(`${name} legacy 'button'`, () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const Component = component as any;
      const Button: React.FC<any> = (props) => <h1 {...props} />;

      render(
        <Component
          components={{
            button: Button,
          }}
          picker="time"
          showNow
          open
        />,
      );

      // Fallback for both 'nowButton' and 'okButton'
      expect(document.querySelector('.rc-picker-footer').querySelectorAll('h1')).toHaveLength(2);
      expect(document.querySelector('.rc-picker-now').tagName).toBe('H1');
      expect(document.querySelector('.rc-picker-ok').tagName).toBe('H1');

      // Legacy 'button' should not receive the native 'type' attribute
      expect(document.querySelector('.rc-picker-ok')).not.toHaveAttribute('type');

      expect(errorSpy).toHaveBeenCalledWith(
        "Warning: 'components.button' is deprecated. Please use 'components.nowButton' and 'components.okButton' instead.",
      );

      errorSpy.mockRestore();
    });

    it(`${name} 'nowButton' and 'okButton' override legacy 'button'`, () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const Component = component as any;
      const Legacy: React.FC<any> = (props) => <h1 {...props} />;
      const NowButton: React.FC<any> = (props) => <h2 {...props} />;
      const OkButton: React.FC<any> = (props) => <h3 {...props} />;

      render(
        <Component
          components={{
            button: Legacy,
            nowButton: NowButton,
            okButton: OkButton,
          }}
          picker="time"
          showNow
          open
        />,
      );

      expect(document.querySelector('.rc-picker-footer').querySelectorAll('h1')).toHaveLength(0);
      expect(document.querySelector('.rc-picker-now').tagName).toBe('H2');
      expect(document.querySelector('.rc-picker-ok').tagName).toBe('H3');

      errorSpy.mockRestore();
    });
  });
});

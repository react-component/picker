import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import {
  closePicker,
  DayPicker,
  DayRangePicker,
  getMoment,
  openPicker,
  waitFakeTimer,
} from './util/commonUtil';

describe('Picker.ChangeOnBlur', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(getMoment('1990-09-03 00:00:00').valueOf());
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('Picker', async () => {
    const { container } = render(<DayPicker preserveInvalidOnBlur />);

    // Open
    openPicker(container);

    const inputEle = container.querySelector('input');
    fireEvent.change(inputEle, {
      target: {
        value: 'no valid',
      },
    });

    closePicker(container);
    await waitFakeTimer();
    expect(inputEle).toHaveValue('no valid');
  });

  it('RangePicker', async () => {
    const { container } = render(<DayRangePicker preserveInvalidOnBlur />);

    const startInputEle = container.querySelectorAll('input')[0];
    const endInputEle = container.querySelectorAll('input')[1];

    // Open
    openPicker(container);
    fireEvent.change(startInputEle, {
      target: {
        value: 'no valid 1',
      },
    });

    openPicker(container, 1);
    fireEvent.change(endInputEle, {
      target: {
        value: 'no valid 2',
      },
    });

    // Close
    closePicker(container, 1);
    await waitFakeTimer();
    expect(startInputEle).toHaveValue('no valid 1');
    expect(endInputEle).toHaveValue('no valid 2');
  });
});

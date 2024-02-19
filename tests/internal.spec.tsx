import { render } from '@testing-library/react';
import React from 'react';
import { DayPickerPanel, getMoment } from './util/commonUtil';

// Note: Props tested in this file is safe to remove when refactor
describe('Picker.Internal', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(getMoment('1990-09-03 00:00:00').valueOf());
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('hideHeader', async () => {
    const { container, rerender } = render(<DayPickerPanel />);
    expect(container.querySelector('.rc-picker-header')).toBeTruthy();

    rerender(<DayPickerPanel hideHeader />);
    expect(container.querySelector('.rc-picker-header')).toBeFalsy();
  });
});

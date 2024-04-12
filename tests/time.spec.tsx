import { render } from '@testing-library/react';
import { resetWarned } from 'rc-util/lib/warning';
import React from 'react';
import { DayPicker, getDay, openPicker, selectCell } from './util/commonUtil';

describe('Picker.Time', () => {
  beforeEach(() => {
    resetWarned();
    jest.useFakeTimers().setSystemTime(getDay('1990-09-03 00:00:00').valueOf());
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('show columns for one of it is false', async () => {
    const { container } = render(<DayPicker showTime showMinute={false} />);

    openPicker(container);
    expect(document.querySelectorAll('.rc-picker-time-panel-column')).toHaveLength(2);

    // Select
    selectCell(3);

    expect(container.querySelector('input')).toHaveValue('1990-09-03 00:00');
  });
});

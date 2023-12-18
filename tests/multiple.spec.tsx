/* eslint-disable @typescript-eslint/no-loop-func */
import { fireEvent, render } from '@testing-library/react';
import { resetWarned } from 'rc-util/lib/warning';
import React from 'react';
import { DayPicker, getDay, isOpen, openPicker, selectCell } from './util/commonUtil';

const fakeTime = getDay('1990-09-03 00:00:00').valueOf();

describe('Picker.Multiple', () => {
  // let errorSpy: ReturnType<typeof jest.spyOn>;

  beforeAll(() => {
    // errorSpy = jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(fakeTime);
    // errorSpy.mockReset();
    resetWarned();
  });
  afterAll(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('onChange', () => {
    const onChange = jest.fn();
    const { container } = render(<DayPicker multiple onChange={onChange} />);

    openPicker(container);
    selectCell(1);
    selectCell(3);
    selectCell(5);

    expect(onChange).not.toHaveBeenCalled();
    expect(isOpen()).toBeTruthy();

    // Confirm
    fireEvent.click(document.querySelector('.rc-picker-ok button'));
    expect(onChange).toHaveBeenCalledWith(expect.anything(), [
      '1990-09-01',
      '1990-09-03',
      '1990-09-05',
    ]);

    expect(onChange.mock.calls[0][0]).toHaveLength(3);
  });
});

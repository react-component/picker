import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { getMoment, isOpen, MomentPicker, MomentRangePicker, openPicker } from './util/commonUtil';

describe('Picker.ChangeOnBlur', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(getMoment('1990-09-03 00:00:00').valueOf());
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('Picker', () => {
    const onSelect = jest.fn();
    const onChange = jest.fn();

    const { container } = render(
      <>
        <MomentPicker changeOnBlur showTime onSelect={onSelect} onChange={onChange} />
        <button className="outside" />
      </>,
    );

    // Open
    fireEvent.click(container.querySelector('input'));
    fireEvent.focus(container.querySelector('input'));

    fireEvent.click(document.querySelector('.rc-picker-cell-inner'));
    expect(onSelect).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();

    container.querySelector<HTMLButtonElement>('.outside').focus();
    fireEvent.blur(container.querySelector('input'));
    expect(onChange).toHaveBeenCalled();
  });

  it('RangePicker', () => {
    const onChange = jest.fn();

    const { container } = render(
      <>
        <MomentRangePicker changeOnBlur showTime onChange={onChange} />
        <button className="outside" />
      </>,
    );

    // Open
    fireEvent.mouseDown(container.querySelectorAll('input')[0]);
    fireEvent.click(container.querySelectorAll('input')[0]);
    fireEvent.focus(container.querySelectorAll('input')[0]);

    fireEvent.click(document.querySelectorAll('.rc-picker-cell-inner')[0]);
    expect(onChange).not.toHaveBeenCalled();

    // Second Input
    fireEvent.mouseDown(container.querySelectorAll('input')[1]);
    fireEvent.click(container.querySelectorAll('input')[1]);
    fireEvent.focus(container.querySelectorAll('input')[1]);

    const cells = document.querySelectorAll('.rc-picker-time-panel-cell-inner');
    fireEvent.click(cells[cells.length - 1]);

    // Blur
    container.querySelector<HTMLButtonElement>('.outside').focus();
    fireEvent.blur(container.querySelectorAll('input')[1]);
    expect(onChange).toHaveBeenCalled();
  });

  it('blur & close should not trigger change', () => {
    const onCalendarChange = jest.fn();

    const { container } = render(
      <>
        <MomentRangePicker
          changeOnBlur
          defaultValue={[getMoment('2000-01-01'), getMoment('2000-01-05')]}
          onCalendarChange={onCalendarChange}
        />
      </>,
    );

    expect(isOpen()).toBeFalsy();
    fireEvent.blur(container.querySelector('input'));
    expect(onCalendarChange).not.toHaveBeenCalled();

    // Open to trigger
    openPicker(container);
    expect(isOpen()).toBeTruthy();
    fireEvent.blur(container.querySelector('input'));
    expect(onCalendarChange).toHaveBeenCalled();
  });
});

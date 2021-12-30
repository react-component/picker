import React from 'react';
import type { Moment } from 'moment';
import { resetWarned } from 'rc-util/lib/warning';
import { mount, getMoment, isSame, MomentPicker, MomentRangePicker } from './util/commonUtil';

describe('Picker.DisabledTime', () => {
  it('disabledTime on TimePicker', () => {
    const wrapper = mount(
      <MomentPicker
        open
        picker="time"
        disabledTime={() => ({
          disabledSeconds: () => new Array(59).fill(0).map((_, index) => index),
        })}
      />,
    );

    expect(
      wrapper.find('ul.rc-picker-time-panel-column li.rc-picker-time-panel-cell-disabled'),
    ).toHaveLength(59);
  });

  it('disabledTime on TimeRangePicker', () => {
    const wrapper = mount(
      <MomentRangePicker
        open
        picker="time"
        disabledTime={(_, type) => ({
          disabledHours: () => (type === 'start' ? [1, 3, 5] : [2, 4]),
        })}
      />,
    );

    expect(
      wrapper.find('ul.rc-picker-time-panel-column li.rc-picker-time-panel-cell-disabled'),
    ).toHaveLength(3);

    // Click another one
    wrapper.find('input').last().simulate('mouseDown');
    expect(
      wrapper.find('ul.rc-picker-time-panel-column li.rc-picker-time-panel-cell-disabled'),
    ).toHaveLength(2);
  });

  it('disabledTime', () => {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const disabledTime = jest.fn((_: Moment | null, __: 'start' | 'end') => ({
      disabledHours: () => [11],
    }));

    const wrapper = mount(
      <MomentRangePicker
        showTime
        disabledTime={disabledTime}
        defaultValue={[getMoment('1989-11-28'), getMoment('1990-09-03')]}
      />,
    );

    // Start
    wrapper.openPicker();
    expect(
      wrapper
        .find('PickerPanel')
        .first()
        .find('.rc-picker-time-panel-column')
        .first()
        .find('li')
        .at(11)
        .hasClass('rc-picker-time-panel-cell-disabled'),
    ).toBeTruthy();
    expect(isSame(disabledTime.mock.calls[0][0], '1989-11-28')).toBeTruthy();
    expect(disabledTime.mock.calls[0][1]).toEqual('start');
    wrapper.closePicker();

    // End
    disabledTime.mockClear();
    wrapper.openPicker(1);
    expect(
      wrapper
        .find('PickerPanel')
        .last()
        .find('.rc-picker-time-panel-column')
        .first()
        .find('li')
        .at(11)
        .hasClass('rc-picker-time-panel-cell-disabled'),
    ).toBeTruthy();
    expect(isSame(disabledTime.mock.calls[0][0], '1990-09-03')).toBeTruthy();
    expect(disabledTime.mock.calls[0][1]).toEqual('end');
    wrapper.closePicker(1);
  });

  describe('warning for legacy props', () => {
    it('single', () => {
      resetWarned();
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mount(<MomentPicker picker="time" disabledMinutes={() => []} />);
      expect(errSpy).toHaveBeenCalledWith(
        "Warning: 'disabledHours', 'disabledMinutes', 'disabledSeconds' will be removed in the next major version, please use 'disabledTime' instead.",
      );

      errSpy.mockRestore();
    });

    it('range', () => {
      resetWarned();
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mount(<MomentRangePicker picker="time" disabledMinutes={() => []} />);
      expect(errSpy).toHaveBeenCalledWith(
        "Warning: 'disabledHours', 'disabledMinutes', 'disabledSeconds' will be removed in the next major version, please use 'disabledTime' instead.",
      );

      errSpy.mockRestore();
    });
  });
});

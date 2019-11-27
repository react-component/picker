import React from 'react';
import MockDate from 'mockdate';
import {
  mount,
  getMoment,
  isSame,
  MomentRangePicker,
  Wrapper,
} from './util/commonUtil';

describe('Range', () => {
  beforeAll(() => {
    MockDate.set(getMoment('1990-09-03 00:00:00').toDate());
  });

  afterAll(() => {
    MockDate.reset();
  });

  describe('value', () => {
    function matchValues(wrapper: Wrapper, value1: string, value2: string) {
      expect(
        wrapper
          .find('input')
          .first()
          .props().value,
      ).toEqual(value1);
      expect(
        wrapper
          .find('input')
          .last()
          .props().value,
      ).toEqual(value2);
    }

    it('defaultValue', () => {
      const wrapper = mount(
        <MomentRangePicker
          defaultValue={[getMoment('1989-11-28'), getMoment('1990-09-03')]}
        />,
      );

      matchValues(wrapper, '1989-11-28', '1990-09-03');
    });

    it('controlled', () => {
      const wrapper = mount(
        <MomentRangePicker
          value={[getMoment('1989-11-28'), getMoment('1990-09-03')]}
        />,
      );

      matchValues(wrapper, '1989-11-28', '1990-09-03');

      // Update
      wrapper.setProps({
        value: [getMoment('2000-01-01'), getMoment('2011-12-12')],
      });
      wrapper.update();
      matchValues(wrapper, '2000-01-01', '2011-12-12');
    });

    it('uncontrolled', () => {
      const onChange = jest.fn();
      const onCalendarChange = jest.fn();
      const wrapper = mount(
        <MomentRangePicker
          onChange={onChange}
          onCalendarChange={onCalendarChange}
        />,
      );

      // Start date
      wrapper.openPicker();
      wrapper.selectCell(13, 0);
      wrapper.closePicker();

      expect(onChange).not.toHaveBeenCalled();

      expect(
        isSame(onCalendarChange.mock.calls[0][0][0], '1990-09-13'),
      ).toBeTruthy();
      expect(onCalendarChange.mock.calls[0][0][1]).toBeFalsy();
      expect(onCalendarChange.mock.calls[0][1]).toEqual(['1990-09-13', '']);

      // End date
      onCalendarChange.mockReset();
      wrapper.openPicker(1);
      wrapper.selectCell(14, 1);
      wrapper.closePicker(1);

      expect(isSame(onChange.mock.calls[0][0][0], '1990-09-13')).toBeTruthy();
      expect(isSame(onChange.mock.calls[0][0][1], '1990-09-14')).toBeTruthy();
      expect(onChange.mock.calls[0][1]).toEqual(['1990-09-13', '1990-09-14']);

      expect(
        isSame(onCalendarChange.mock.calls[0][0][0], '1990-09-13'),
      ).toBeTruthy();
      expect(
        isSame(onCalendarChange.mock.calls[0][0][1], '1990-09-14'),
      ).toBeTruthy();
      expect(onCalendarChange.mock.calls[0][1]).toEqual([
        '1990-09-13',
        '1990-09-14',
      ]);
    });

    it('exchanged value should re-order', () => {
      const wrapper = mount(
        <MomentRangePicker
          defaultValue={[getMoment('1990-09-03'), getMoment('1989-11-28')]}
        />,
      );

      matchValues(wrapper, '1989-11-28', '1990-09-03');
    });

    it('Reset when startDate is after endDate', () => {
      const onChange = jest.fn();
      const wrapper = mount(<MomentRangePicker onChange={onChange} />);

      wrapper.openPicker(1);
      wrapper.selectCell(7, 1);
      wrapper.closePicker(1);

      wrapper.openPicker(0);
      wrapper.selectCell(23, 0);
      wrapper.closePicker(0);
      expect(onChange).not.toHaveBeenCalled();
      matchValues(wrapper, '1990-09-23', '');
    });
  });
});

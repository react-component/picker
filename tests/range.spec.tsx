import React from 'react';
import MockDate from 'mockdate';
import KeyCode from 'rc-util/lib/KeyCode';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import { Moment } from 'moment';
import {
  mount,
  getMoment,
  isSame,
  MomentRangePicker,
  Wrapper,
} from './util/commonUtil';

describe('Range', () => {
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

  beforeAll(() => {
    MockDate.set(getMoment('1990-09-03 00:00:00').toDate());
  });

  afterAll(() => {
    MockDate.reset();
  });

  describe('value', () => {
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
  });

  it('exchanged value should re-order', () => {
    const wrapper = mount(
      <MomentRangePicker
        defaultValue={[getMoment('1990-09-03'), getMoment('1989-11-28')]}
      />,
    );

    matchValues(wrapper, '1989-11-28', '1990-09-03');
  });

  it('endDate can not click before startDate', () => {
    const onChange = jest.fn();

    const wrapper = mount(
      <MomentRangePicker
        onChange={onChange}
        disabledDate={date => date.date() === 28}
        allowClear
      />,
    );

    let cellNode: Wrapper;

    // Start date
    wrapper.openPicker();
    wrapper.selectCell(23);
    wrapper.closePicker();

    // End date
    wrapper.openPicker(1);
    cellNode = wrapper.selectCell(11);
    expect(cellNode.hasClass('rc-picker-cell-disabled')).toBeTruthy();
    wrapper.closePicker(1);
    expect(onChange).not.toHaveBeenCalled();

    // Click start origin disabled date
    wrapper.openPicker();
    cellNode = wrapper.selectCell(28);
    expect(cellNode.hasClass('rc-picker-cell-disabled')).toBeTruthy();
    wrapper.closePicker();
    expect(onChange).not.toHaveBeenCalled();

    // Click end origin disabled date
    wrapper.openPicker(1);
    cellNode = wrapper.selectCell(28, 1);
    expect(cellNode.hasClass('rc-picker-cell-disabled')).toBeTruthy();
    wrapper.closePicker(1);
    expect(onChange).not.toHaveBeenCalled();
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

  it('allowEmpty', () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <MomentRangePicker
        onChange={onChange}
        allowEmpty={[false, true]}
        allowClear
      />,
    );

    wrapper.openPicker();
    wrapper.selectCell(11);
    wrapper.closePicker();
    expect(onChange).toHaveBeenCalledWith(
      [expect.anything(), null],
      ['1990-09-11', ''],
    );

    wrapper.clearValue();
    onChange.mockReset();

    // Not allow empty with startDate
    wrapper.openPicker(1);
    wrapper.selectCell(23, 1);
    wrapper.closePicker(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  describe('selectable', () => {
    it('basic disabled check', () => {
      const wrapper = mount(<MomentRangePicker selectable={[false, true]} />);
      expect(
        wrapper
          .find('input')
          .at(0)
          .props().disabled,
      ).toBeTruthy();
      expect(
        wrapper
          .find('input')
          .at(1)
          .props().disabled,
      ).toBeFalsy();
    });

    it('startDate will have disabledDate when endDate is not selectable', () => {
      const onChange = jest.fn();
      const wrapper = mount(
        <MomentRangePicker
          selectable={[true, false]}
          defaultValue={[null, getMoment('1990-09-22')]}
          onChange={onChange}
        />,
      );

      let cellNode: Wrapper;

      // Disabled date
      wrapper.openPicker();
      cellNode = wrapper.selectCell(25);
      expect(cellNode.hasClass('rc-picker-cell-disabled')).toBeTruthy();
      wrapper.closePicker();
      expect(onChange).not.toHaveBeenCalled();

      // Enabled date
      wrapper.openPicker();
      cellNode = wrapper.selectCell(7);
      expect(cellNode.hasClass('rc-picker-cell-disabled')).toBeFalsy();
      wrapper.closePicker();
      expect(onChange).toHaveBeenCalledWith(
        [expect.anything(), expect.anything()],
        ['1990-09-07', '1990-09-22'],
      );
    });
  });

  it('ranges', () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <MomentRangePicker
        ranges={{
          test: [getMoment('1989-11-28'), getMoment('1990-09-03')],
          func: () => [getMoment('2000-01-01'), getMoment('2010-11-11')],
        }}
        onChange={onChange}
      />,
    );

    wrapper.openPicker();
    let testNode;

    // Basic
    testNode = wrapper.find('.rc-picker-ranges li').first();
    expect(testNode.text()).toEqual('test');
    testNode.simulate('click');
    expect(onChange).toHaveBeenCalledWith(
      [expect.anything(), expect.anything()],
      ['1989-11-28', '1990-09-03'],
    );

    // Function
    testNode = wrapper.find('.rc-picker-ranges li').last();
    expect(testNode.text()).toEqual('func');
    testNode.simulate('click');
    expect(onChange).toHaveBeenCalledWith(
      [expect.anything(), expect.anything()],
      ['2000-01-01', '2010-11-11'],
    );
  });

  it('placeholder', () => {
    const wrapper = mount(
      <MomentRangePicker placeholder={['light', 'bamboo']} />,
    );
    expect(
      wrapper
        .find('input')
        .first()
        .props().placeholder,
    ).toEqual('light');
    expect(
      wrapper
        .find('input')
        .last()
        .props().placeholder,
    ).toEqual('bamboo');
  });

  it('defaultPickerValue', () => {
    const wrapper = mount(
      <MomentRangePicker
        defaultPickerValue={[getMoment('1989-11-28'), getMoment('1990-09-03')]}
      />,
    );

    wrapper.openPicker();
    expect(
      wrapper
        .find('PickerPanel')
        .first()
        .find('.rc-picker-header-view')
        .text(),
    ).toEqual('Nov1989');
    wrapper.closePicker();

    wrapper.openPicker(1);
    expect(
      wrapper
        .find('PickerPanel')
        .last()
        .find('.rc-picker-header-view')
        .text(),
    ).toEqual('Sep1990');
    wrapper.closePicker(1);
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

  describe('focus test', () => {
    let domMock: ReturnType<typeof spyElementPrototypes>;
    let focused = false;
    let blurred = false;

    beforeAll(() => {
      domMock = spyElementPrototypes(HTMLElement, {
        focus: () => {
          focused = true;
        },
        blur: () => {
          blurred = true;
        },
      });
    });

    beforeEach(() => {
      focused = false;
      blurred = false;
    });

    afterAll(() => {
      domMock.mockRestore();
    });

    it('function call', () => {
      const ref = React.createRef<MomentRangePicker>();
      mount(
        <div>
          <MomentRangePicker ref={ref} />
        </div>,
      );

      ref.current!.rangePickerRef.current!.focus();
      expect(focused).toBeTruthy();

      ref.current!.rangePickerRef.current!.blur();
      expect(blurred).toBeTruthy();
    });

    it('not crash with showTime defaultValue', () => {
      const wrapper = mount(
        <MomentRangePicker
          showTime={{
            defaultValue: [getMoment('01:02:03'), getMoment('05:06:07')],
          }}
        />,
      );

      wrapper.openPicker();
      wrapper.selectCell(13);
      wrapper.closePicker();

      wrapper.openPicker(1);
      wrapper.selectCell(23, 1);
      wrapper.closePicker(1);

      matchValues(wrapper, '1990-09-13 01:02:03', '1990-09-23 05:06:07');
    });
  });

  it('mode is array', () => {
    const wrapper = mount(<MomentRangePicker mode={['year', 'month']} />);
    wrapper.openPicker();
    expect(wrapper.find('.rc-picker-year-panel')).toHaveLength(1);

    wrapper.openPicker(1);
    expect(wrapper.find('.rc-picker-month-panel')).toHaveLength(1);
  });

  describe('onPanelChange is array args', () => {
    it('mode', () => {
      const onPanelChange = jest.fn();
      const wrapper = mount(
        <MomentRangePicker
          mode={['month', 'year']}
          onPanelChange={onPanelChange}
        />,
      );

      wrapper.openPicker();
      wrapper.selectCell('Feb');
      expect(isSame(onPanelChange.mock.calls[0][0][0], '1990-02-03'));
      expect(onPanelChange.mock.calls[0][1]).toEqual(['date', 'year']);

      wrapper.closePicker();
      onPanelChange.mockReset();

      wrapper.openPicker(1);
      wrapper.selectCell(1993, 1);
      expect(isSame(onPanelChange.mock.calls[0][0][1], '1993-09-03'));
      expect(onPanelChange.mock.calls[0][1]).toEqual(['month', 'month']);
    });

    it('picker', () => {
      const onPanelChange = jest.fn();
      const wrapper = mount(
        <MomentRangePicker picker="month" onPanelChange={onPanelChange} />,
      );

      // First go to year panel
      wrapper.openPicker();
      wrapper.find('.rc-picker-year-btn').simulate('click');
      expect(isSame(onPanelChange.mock.calls[0][0][0], '1990-09-03'));
      expect(onPanelChange.mock.calls[0][1]).toEqual(['year', 'month']);

      // First nack to month panel
      onPanelChange.mockReset();
      wrapper.selectCell(1993);
      expect(onPanelChange).toHaveBeenCalled();
      expect(isSame(onPanelChange.mock.calls[0][0][0], '1993-09-03'));
      expect(onPanelChange.mock.calls[0][1]).toEqual(['month', 'month']);

      // Last go to year panel
      wrapper.closePicker();
      wrapper.openPicker(1);
      wrapper
        .find('Picker')
        .last()
        .find('.rc-picker-year-btn')
        .simulate('click');
      onPanelChange.mockReset();

      // Last nack to month panel
      wrapper.selectCell(1998, 1);
      expect(isSame(onPanelChange.mock.calls[0][0][1], '1998-09-03'));
      expect(onPanelChange.mock.calls[0][1]).toEqual(['month', 'month']);
    });
  });

  it('type can not change before start time', () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <MomentRangePicker
        defaultValue={[getMoment('2000-01-15'), getMoment('2000-01-16')]}
        onChange={onChange}
      />,
    );

    wrapper
      .find('input')
      .last()
      .simulate('change', {
        target: {
          value: '2000-01-11',
        },
      });
    wrapper
      .find('input')
      .last()
      .simulate('keyDown', {
        which: KeyCode.ENTER,
      });

    expect(onChange).not.toHaveBeenCalled();
  });
});

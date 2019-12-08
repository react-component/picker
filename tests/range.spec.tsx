import React from 'react';
import MockDate from 'mockdate';
import { act } from 'react-dom/test-utils';
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

describe('Picker.Range', () => {
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
      expect(onChange).not.toHaveBeenCalled();

      wrapper.selectCell(13);
      expect(onChange).not.toHaveBeenCalled();

      expect(
        isSame(onCalendarChange.mock.calls[0][0][0], '1990-09-13'),
      ).toBeTruthy();
      expect(onCalendarChange.mock.calls[0][0][1]).toBeFalsy();
      expect(onCalendarChange.mock.calls[0][1]).toEqual(['1990-09-13', '']);

      // End date
      onCalendarChange.mockReset();
      wrapper.selectCell(14);

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
    wrapper.update();

    matchValues(wrapper, '1989-11-28', '1990-09-03');
  });

  describe('view is closed', () => {
    it('year', () => {
      const wrapper = mount(<MomentRangePicker picker="year" />);
      wrapper.openPicker();
      expect(
        wrapper
          .find('.rc-picker-header-view')
          .first()
          .text(),
      ).toEqual('1990-1999');
      expect(
        wrapper
          .find('.rc-picker-header-view')
          .last()
          .text(),
      ).toEqual('2000-2009');
    });
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

    // End date
    cellNode = wrapper.selectCell(11);
    expect(cellNode.hasClass('rc-picker-cell-disabled')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();

    // Click origin disabled date
    cellNode = wrapper.selectCell(28);
    expect(cellNode.hasClass('rc-picker-cell-disabled')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Reset when startDate is after endDate', () => {
    const onChange = jest.fn();
    const wrapper = mount(<MomentRangePicker onChange={onChange} />);

    wrapper.openPicker(1);
    wrapper.selectCell(7);

    wrapper.openPicker(0);
    wrapper.selectCell(23);
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
    expect(onChange).toHaveBeenCalledWith(
      [expect.anything(), null],
      ['1990-09-11', ''],
    );

    wrapper.clearValue();
    onChange.mockReset();

    // Not allow empty with startDate
    wrapper.openPicker(1);
    wrapper.selectCell(23);
    wrapper.closePicker(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  describe('disabled', () => {
    it('basic disabled check', () => {
      const wrapper = mount(<MomentRangePicker disabled={[true, false]} />);
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
          disabled={[false, true]}
          defaultValue={[null, getMoment('1990-09-22')]}
          onChange={onChange}
        />,
      );

      let cellNode: Wrapper;

      // Disabled date
      wrapper.openPicker();
      cellNode = wrapper.selectCell(25, 1);
      expect(cellNode.hasClass('rc-picker-cell-disabled')).toBeTruthy();
      expect(onChange).not.toHaveBeenCalled();

      // Enabled date
      wrapper.openPicker();
      cellNode = wrapper.selectCell(7, 1);
      expect(cellNode.hasClass('rc-picker-cell-disabled')).toBeFalsy();
      expect(onChange).toHaveBeenCalledWith(
        [expect.anything(), expect.anything()],
        ['1990-09-07', '1990-09-22'],
      );
    });

    it('null value with disabled', () => {
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mount(
        <MomentRangePicker disabled={[false, true]} value={[null, null]} />,
      );

      expect(errSpy).toHaveBeenCalledWith(
        'Warning: `disabled` should not set with empty `value`. You should set `allowEmpty` or `value` instead.',
      );
      errSpy.mockReset();
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
    ).toEqual('Oct1990');
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
      wrapper.selectCell(23);
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
      wrapper.selectCell(1993);
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
      wrapper
        .find('.rc-picker-year-btn')
        .first()
        .simulate('click');
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
        .find('.rc-picker-year-btn')
        .first()
        .simulate('click');
      onPanelChange.mockReset();

      // Last nack to month panel
      wrapper.selectCell(1998);
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

  it('should open last when first selected', () => {
    jest.useFakeTimers();
    const onOpenChange = jest.fn();
    const wrapper = mount(<MomentRangePicker onOpenChange={onOpenChange} />);
    expect(wrapper.find('PickerPanel')).toHaveLength(0);

    wrapper.openPicker();
    expect(
      wrapper
        .find('.rc-picker-input')
        .first()
        .hasClass('rc-picker-input-active'),
    ).toBeTruthy();

    // Select to active next
    wrapper.selectCell(11);
    jest.runAllTimers();
    expect(
      wrapper
        .find('.rc-picker-input')
        .last()
        .hasClass('rc-picker-input-active'),
    ).toBeTruthy();

    wrapper.unmount();

    jest.useRealTimers();
  });

  describe('hover className', () => {
    [
      { picker: 'year', start: 1990, end: 1997, mid: 1991 },
      { picker: 'month', start: 'Feb', end: 'Oct', mid: 'May' },
      { picker: 'date', start: 11, end: 22, mid: 15 },
    ].forEach(({ picker, start, end, mid }) => {
      it('year', () => {
        const wrapper = mount(<MomentRangePicker picker={picker as any} />);
        wrapper.openPicker();
        wrapper.selectCell(start);

        // Hover it
        wrapper.findCell(end).simulate('mouseEnter');

        expect(
          wrapper.findCell(start).hasClass('rc-picker-cell-range-hover-start'),
        ).toBeTruthy();
        expect(
          wrapper.findCell(mid).hasClass('rc-picker-cell-range-hover'),
        ).toBeTruthy();
        expect(
          wrapper.findCell(end).hasClass('rc-picker-cell-range-hover-end'),
        ).toBeTruthy();

        // Leave
        wrapper.findCell(end).simulate('mouseLeave');
        expect(
          wrapper.findCell(start).hasClass('rc-picker-cell-range-hover-start'),
        ).toBeFalsy();
        expect(
          wrapper.findCell(mid).hasClass('rc-picker-cell-range-hover'),
        ).toBeFalsy();
        expect(
          wrapper.findCell(end).hasClass('rc-picker-cell-range-hover-end'),
        ).toBeFalsy();
      });
    });

    it('range edge className', () => {
      const wrapper = mount(
        <MomentRangePicker
          value={[getMoment('1990-09-20'), getMoment('1990-09-20')]}
        />,
      );

      // End edge
      wrapper.openPicker();
      wrapper.findCell(10).simulate('mouseEnter');
      expect(
        wrapper.findCell(19).hasClass('rc-picker-cell-range-hover-edge-end'),
      ).toBeTruthy();
      wrapper.findCell(10).simulate('mouseOut');

      // Start edge
      wrapper.openPicker(1);
      wrapper.findCell(28).simulate('mouseEnter');
      expect(
        wrapper.findCell(21).hasClass('rc-picker-cell-range-hover-edge-start'),
      ).toBeTruthy();
      wrapper.findCell(28).simulate('mouseOut');
    });
  });

  it('should close when user focus out', () => {
    const wrapper = mount(<MomentRangePicker />);
    wrapper.openPicker();
    wrapper.selectCell(11);
    expect(wrapper.isOpen()).toBeTruthy();

    wrapper
      .find('input')
      .last()
      .simulate('blur');
    expect(wrapper.isOpen()).toBeFalsy();
  });

  it('icon', () => {
    const wrapper = mount(
      <MomentRangePicker
        defaultValue={[getMoment('1990-09-03'), getMoment('1990-09-03')]}
        suffixIcon={<span className="suffix-icon" />}
        clearIcon={<span className="suffix-icon" />}
        allowClear
      />,
    );

    expect(wrapper.render()).toMatchSnapshot();
  });

  it('block native mouseDown in panel to prevent focus changed', () => {
    const wrapper = mount(<MomentRangePicker />);
    wrapper.openPicker();

    const preventDefault = jest.fn();
    wrapper
      .find('td')
      .first()
      .simulate('mouseDown', { preventDefault });

    expect(preventDefault).toHaveBeenCalled();
  });

  describe('arrow position', () => {
    let domMock: ReturnType<typeof spyElementPrototypes>;

    beforeAll(() => {
      domMock = spyElementPrototypes(HTMLElement, {
        offsetWidth: {
          get: () => 100,
        },
      });
    });

    afterAll(() => {
      domMock.mockRestore();
    });

    it('end date arrow should move panel left', () => {
      const wrapper = mount(<MomentRangePicker />);
      wrapper.openPicker(1);
      wrapper.update();
      expect(
        wrapper.find('.rc-picker-panel-container').props().style?.marginLeft,
      ).toEqual(200);
    });
  });

  it('fixed open need repeat trigger onOpenChange', () => {
    jest.useFakeTimers();
    const onOpenChange = jest.fn();
    const wrapper = mount(
      <MomentRangePicker onOpenChange={onOpenChange} open />,
    );

    for (let i = 0; i < 10; i += 1) {
      const clickEvent = new Event('mousedown');
      Object.defineProperty(clickEvent, 'target', {
        get: () => document.body,
      });
      act(() => {
        window.dispatchEvent(clickEvent);
        wrapper
          .find('input')
          .first()
          .simulate('blur');
      });

      // Maybe not good since onOpenChange trigger twice
      expect(onOpenChange).toHaveBeenCalledTimes((i + 1) * 2);
    }
    act(() => {
      jest.runAllTimers();
    });
    jest.useRealTimers();
  });

  it('datetime display ok button', () => {
    const onCalendarChange = jest.fn();
    const onOk = jest.fn();
    const wrapper = mount(
      <MomentRangePicker
        showTime
        onCalendarChange={onCalendarChange}
        onOk={onOk}
      />,
    );
    wrapper.openPicker();

    // Not trigger when not value
    expect(wrapper.find('.rc-picker-ok button').props().disabled).toBeTruthy();

    // Trigger when valued
    onCalendarChange.mockReset();
    wrapper.selectCell(11);
    wrapper.find('.rc-picker-ok button').simulate('click');
    expect(onCalendarChange).toHaveBeenCalledWith(
      [expect.anything(), null],
      ['1990-09-11 00:00:00', ''],
    );
    expect(onOk).toHaveBeenCalled();
  });

  it('datetime will reset by blur', () => {
    const wrapper = mount(<MomentRangePicker showTime />);
    wrapper.openPicker();
    wrapper.selectCell(11);

    const clickEvent = new Event('mousedown');
    Object.defineProperty(clickEvent, 'target', {
      get: () => document.body,
    });
    act(() => {
      window.dispatchEvent(clickEvent);
    });

    wrapper.update();
    expect(wrapper.isOpen()).toBeFalsy();
    expect(wrapper.find('input').first().props().value).toEqual('');
  });
});

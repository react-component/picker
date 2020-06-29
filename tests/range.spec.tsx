import React from 'react';
import MockDate from 'mockdate';
import { act } from 'react-dom/test-utils';
import KeyCode from 'rc-util/lib/KeyCode';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import { Moment } from 'moment';
import { mount, getMoment, isSame, MomentRangePicker, Wrapper } from './util/commonUtil';
import zhCN from '../src/locale/zh_CN';
import { PickerMode } from '../src/interface';

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

  beforeEach(() => {
    if (document.activeElement) (document.activeElement as any).blur();
  });

  describe('value', () => {
    it('defaultValue', () => {
      const wrapper = mount(
        <MomentRangePicker defaultValue={[getMoment('1989-11-28'), getMoment('1990-09-03')]} />,
      );

      matchValues(wrapper, '1989-11-28', '1990-09-03');
    });

    it('controlled', () => {
      const wrapper = mount(
        <MomentRangePicker value={[getMoment('1989-11-28'), getMoment('1990-09-03')]} />,
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
        <MomentRangePicker onChange={onChange} onCalendarChange={onCalendarChange} />,
      );

      // Start date
      wrapper.openPicker();
      expect(onChange).not.toHaveBeenCalled();

      wrapper.selectCell(13);
      expect(onChange).not.toHaveBeenCalled();

      expect(isSame(onCalendarChange.mock.calls[0][0][0], '1990-09-13')).toBeTruthy();
      expect(onCalendarChange.mock.calls[0][0][1]).toBeFalsy();
      expect(onCalendarChange.mock.calls[0][1]).toEqual(['1990-09-13', '']);

      // End date
      onCalendarChange.mockReset();
      wrapper.selectCell(14);

      expect(isSame(onChange.mock.calls[0][0][0], '1990-09-13')).toBeTruthy();
      expect(isSame(onChange.mock.calls[0][0][1], '1990-09-14')).toBeTruthy();
      expect(onChange.mock.calls[0][1]).toEqual(['1990-09-13', '1990-09-14']);

      expect(isSame(onCalendarChange.mock.calls[0][0][0], '1990-09-13')).toBeTruthy();
      expect(isSame(onCalendarChange.mock.calls[0][0][1], '1990-09-14')).toBeTruthy();
      expect(onCalendarChange.mock.calls[0][1]).toEqual(['1990-09-13', '1990-09-14']);
    });
  });

  it('exchanged value should re-order', () => {
    const wrapper = mount(
      <MomentRangePicker defaultValue={[getMoment('1990-09-03'), getMoment('1989-11-28')]} />,
    );
    wrapper.update();

    matchValues(wrapper, '1989-11-28', '1990-09-03');
  });

  describe('view is closed', () => {
    it('year', () => {
      const wrapper = mount(<MomentRangePicker picker="year" />);
      wrapper.openPicker();
      expect(wrapper.exists('.rc-picker-footer')).toBeFalsy();
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

    it('year with footer', () => {
      const wrapper = mount(
        <MomentRangePicker renderExtraFooter={() => <p>footer</p>} picker="year" />,
      );
      wrapper.openPicker();
      expect(wrapper.find('.rc-picker-footer').text()).toEqual('footer');
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

  it('week picker can not click before start week', () => {
    const wrapper = mount(<MomentRangePicker picker="week" locale={zhCN} />);
    wrapper.openPicker();
    wrapper.selectCell(11);

    expect(wrapper.findCell(4).hasClass('rc-picker-cell-disabled')).toBeTruthy();
    expect(wrapper.findCell(11).hasClass('rc-picker-cell-disabled')).toBeFalsy();
  });

  describe('Can not select when start or end first selected', () => {
    it('select end', () => {
      const wrapper = mount(<MomentRangePicker />);

      wrapper.openPicker(1);
      wrapper.selectCell(7);

      expect(wrapper.findCell(23).hasClass('rc-picker-cell-disabled')).toBeTruthy();
    });

    it('select start', () => {
      const wrapper = mount(<MomentRangePicker picker="quarter" />);

      wrapper.openPicker(0);
      wrapper.selectCell('Q3');

      expect(wrapper.findCell('Q1').hasClass('rc-picker-cell-disabled')).toBeTruthy();
    });

    it('select end', () => {
      const wrapper = mount(<MomentRangePicker picker="month" />);

      wrapper.openPicker(1);
      wrapper.selectCell('May');

      expect(wrapper.findCell('Dec').hasClass('rc-picker-cell-disabled')).toBeTruthy();
    });

    it('disabled start', () => {
      const wrapper = mount(
        <MomentRangePicker
          disabled={[true, false]}
          defaultValue={[getMoment('1990-01-15'), getMoment('1990-02-15')]}
        />,
      );

      wrapper.openPicker(1);
      expect(wrapper.findCell(14).hasClass('rc-picker-cell-disabled')).toBeTruthy();
    });
  });

  it('allowEmpty', () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <MomentRangePicker onChange={onChange} allowEmpty={[false, true]} allowClear />,
    );

    wrapper.openPicker();
    wrapper.selectCell(11);
    expect(onChange).toHaveBeenCalledWith([expect.anything(), null], ['1990-09-11', '']);

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
      cellNode = wrapper.selectCell(25);
      expect(cellNode.hasClass('rc-picker-cell-disabled')).toBeTruthy();
      expect(onChange).not.toHaveBeenCalled();

      // Enabled date
      wrapper.openPicker();
      cellNode = wrapper.selectCell(7);
      expect(cellNode.hasClass('rc-picker-cell-disabled')).toBeFalsy();
      expect(onChange).toHaveBeenCalledWith(
        [expect.anything(), expect.anything()],
        ['1990-09-07', '1990-09-22'],
      );
    });

    it('null value with disabled', () => {
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mount(<MomentRangePicker disabled={[false, true]} value={[null, null]} />);

      expect(errSpy).toHaveBeenCalledWith(
        'Warning: `disabled` should not set with empty `value`. You should set `allowEmpty` or `value` instead.',
      );
      errSpy.mockReset();
    });

    it('clear should trigger change', () => {
      const onChange = jest.fn();
      const wrapper = mount(
        <MomentRangePicker
          disabled={[false, true]}
          defaultValue={[getMoment('1990-01-01'), getMoment('2000-11-11')]}
          onChange={onChange}
          allowClear
        />,
      );

      wrapper.clearValue();
      expect(onChange.mock.calls[0][1]).toEqual(['', '2000-11-11']);
    });

    // https://github.com/ant-design/ant-design/issues/23726
    it('not fill when all disabled and no value', () => {
      const wrapper = mount(<MomentRangePicker disabled />);
      expect(
        wrapper
          .find('input')
          .first()
          .props().value,
      ).toEqual('');
      expect(
        wrapper
          .find('input')
          .last()
          .props().value,
      ).toEqual('');
    });
  });

  describe('ranges', () => {
    it('work', () => {
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
      testNode = wrapper.find('.rc-picker-ranges li span').first();
      expect(testNode.text()).toEqual('test');
      testNode.simulate('click');
      expect(onChange).toHaveBeenCalledWith(
        [expect.anything(), expect.anything()],
        ['1989-11-28', '1990-09-03'],
      );

      // Function
      testNode = wrapper.find('.rc-picker-ranges li span').last();
      expect(testNode.text()).toEqual('func');
      testNode.simulate('click');
      expect(onChange).toHaveBeenCalledWith(
        [expect.anything(), expect.anything()],
        ['2000-01-01', '2010-11-11'],
      );
    });

    it('hover className', () => {
      const wrapper = mount(
        <MomentRangePicker
          ranges={{
            now: [getMoment('1990-09-11'), getMoment('1990-09-13')],
          }}
        />,
      );

      wrapper.openPicker();
      wrapper.find('.rc-picker-preset > *').simulate('mouseEnter');
      expect(wrapper.findCell(11).hasClass('rc-picker-cell-range-start')).toBeTruthy();
      expect(wrapper.findCell(12).hasClass('rc-picker-cell-in-range')).toBeTruthy();
      expect(wrapper.findCell(13).hasClass('rc-picker-cell-range-end')).toBeTruthy();

      wrapper.find('.rc-picker-preset > *').simulate('mouseLeave');
      expect(wrapper.findCell(11).hasClass('rc-picker-cell-range-start')).toBeFalsy();
      expect(wrapper.findCell(12).hasClass('rc-picker-cell-in-range')).toBeFalsy();
      expect(wrapper.findCell(13).hasClass('rc-picker-cell-range-end')).toBeFalsy();
    });
  });

  it('placeholder', () => {
    const wrapper = mount(<MomentRangePicker placeholder={['light', 'bamboo']} />);
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
      <MomentRangePicker defaultPickerValue={[getMoment('1989-11-28'), getMoment('1990-09-03')]} />,
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
      wrapper.find('.rc-picker-ok button').simulate('click');
      wrapper.selectCell(23);

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
        <MomentRangePicker mode={['month', 'year']} onPanelChange={onPanelChange} />,
      );

      wrapper.openPicker();
      wrapper.selectCell('Feb');
      expect(isSame(onPanelChange.mock.calls[0][0][0], '1990-02-03'));
      expect(onPanelChange.mock.calls[0][1]).toEqual(['date', 'year']);

      wrapper.closePicker();
      onPanelChange.mockReset();

      wrapper.openPicker(1);
      wrapper.selectCell(1993);
      expect(isSame(onPanelChange.mock.calls[0][0][1], '1993-02-03'));
      expect(onPanelChange.mock.calls[0][1]).toEqual(['month', 'month']);
    });

    it('picker', () => {
      const onPanelChange = jest.fn();
      const wrapper = mount(<MomentRangePicker picker="month" onPanelChange={onPanelChange} />);

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

    it('should render correctly in rtl', () => {
      const wrapper = mount(<MomentRangePicker direction="rtl" />);
      expect(wrapper.render()).toMatchSnapshot();
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

        expect(wrapper.findCell(start).hasClass('rc-picker-cell-range-hover-start')).toBeTruthy();
        expect(wrapper.findCell(mid).hasClass('rc-picker-cell-range-hover')).toBeTruthy();
        expect(wrapper.findCell(end).hasClass('rc-picker-cell-range-hover-end')).toBeTruthy();

        // Leave
        wrapper.findCell(end).simulate('mouseLeave');
        expect(wrapper.findCell(start).hasClass('rc-picker-cell-range-hover-start')).toBeFalsy();
        expect(wrapper.findCell(mid).hasClass('rc-picker-cell-range-hover')).toBeFalsy();
        expect(wrapper.findCell(end).hasClass('rc-picker-cell-range-hover-end')).toBeFalsy();
      });
    });

    it('range edge className', () => {
      const wrapper = mount(
        <MomentRangePicker value={[getMoment('2019-12-20'), getMoment('2019-12-20')]} />,
      );

      // End edge
      wrapper.openPicker();
      wrapper.findCell(10).simulate('mouseEnter');
      expect(wrapper.findCell(19).hasClass('rc-picker-cell-range-hover-edge-end')).toBeTruthy();
      expect(wrapper.findCell(20).hasClass('rc-picker-cell-range-start-near-hover')).toBeTruthy();
      wrapper.findCell(10).simulate('mouseOut');

      // Start edge
      wrapper.openPicker(1);
      wrapper.findCell(28).simulate('mouseEnter');
      expect(wrapper.findCell(21).hasClass('rc-picker-cell-range-hover-edge-start')).toBeTruthy();
      expect(wrapper.findCell(20).hasClass('rc-picker-cell-range-end-near-hover')).toBeTruthy();
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
      expect((wrapper.find('.rc-picker-panel-container').props() as any).style.marginLeft).toEqual(
        200,
      );
    });
  });

  it('focus to next input not to onOpenChange', () => {
    jest.useFakeTimers();

    const onOpenChange = jest.fn();
    const wrapper = mount(<MomentRangePicker onOpenChange={onOpenChange} />);
    wrapper.openPicker();
    onOpenChange.mockReset();

    const clickEvent = new Event('mousedown');
    Object.defineProperty(clickEvent, 'target', {
      get: () =>
        wrapper
          .find('input')
          .last()
          .instance(),
    });
    act(() => {
      window.dispatchEvent(clickEvent);
      wrapper
        .find('input')
        .first()
        .simulate('blur');
      wrapper
        .find('input')
        .last()
        .simulate('focus');
      jest.runAllTimers();
    });

    expect(onOpenChange).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('fixed open need repeat trigger onOpenChange', () => {
    jest.useFakeTimers();
    const onOpenChange = jest.fn();
    const wrapper = mount(<MomentRangePicker onOpenChange={onOpenChange} open />);

    for (let i = 0; i < 10; i += 1) {
      const clickEvent = new Event('mousedown');
      Object.defineProperty(clickEvent, 'target', {
        get: () => document.body,
      });

      const current = onOpenChange.mock.calls.length;
      act(() => {
        window.dispatchEvent(clickEvent);
        wrapper
          .find('input')
          .first()
          .simulate('blur');
      });
      const next = onOpenChange.mock.calls.length;

      // Maybe not good since onOpenChange trigger twice
      expect(current < next).toBeTruthy();
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
      <MomentRangePicker showTime onCalendarChange={onCalendarChange} onOk={onOk} />,
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
    jest.useFakeTimers();

    const wrapper = mount(<MomentRangePicker showTime />);
    wrapper.openPicker();
    wrapper.selectCell(11);
    wrapper.closePicker();
    act(() => {
      jest.runAllTimers();
    });
    wrapper.update();

    expect(wrapper.isOpen()).toBeFalsy();
    expect(
      wrapper
        .find('input')
        .first()
        .props().value,
    ).toEqual('');

    jest.useRealTimers();
  });

  describe('viewDate', () => {
    function matchTitle(wrapper: Wrapper, title: string) {
      expect(
        wrapper
          .find('.rc-picker-header-view')
          .first()
          .text(),
      ).toEqual(title);
    }

    [
      {
        picker: 'year',
        // Default picker value
        defaultPickerValue: [getMoment('1990-09-03'), getMoment('2000-11-28')],
        defaultPickerValueTitle: ['1990-1999', '2000-2009'],
        // Closing value
        closingValue: [getMoment('1989-09-03'), getMoment('1990-11-28')],
        closingValueTitle: '1980-1989',
        // Far away value
        farValue: [getMoment('1989-09-03'), getMoment('2090-11-28')],
        farValueTitle: ['1980-1989', '2080-2089'],
      },
      {
        picker: 'month',
        // Default picker value
        defaultPickerValue: [getMoment('1990-09-03'), getMoment('2000-11-28')],
        defaultPickerValueTitle: ['1990', '2000'],
        // Closing value
        closingValue: [getMoment('1989-09-03'), getMoment('1989-10-11')],
        closingValueTitle: '1989',
        // Far away value
        farValue: [getMoment('1989-09-03'), getMoment('2000-10-11')],
        farValueTitle: ['1989', '1999'],
      },
      {
        picker: 'date',
        // Default picker value
        defaultPickerValue: [getMoment('1990-09-03'), getMoment('2000-11-28')],
        defaultPickerValueTitle: ['Sep1990', 'Nov2000'],
        // Closing value
        closingValue: [getMoment('1989-09-03'), getMoment('1989-10-11')],
        closingValueTitle: 'Sep1989',
        // Far away value
        farValue: [getMoment('1989-09-03'), getMoment('2000-10-11')],
        farValueTitle: ['Sep1989', 'Sep2000'],
      },
    ].forEach(
      ({
        picker,
        defaultPickerValue,
        defaultPickerValueTitle,
        closingValue,
        closingValueTitle,
        farValue,
        farValueTitle,
      }) => {
        describe(picker, () => {
          it('defaultPickerValue', () => {
            const wrapper = mount(
              <MomentRangePicker
                picker={picker as any}
                defaultPickerValue={defaultPickerValue as any}
              />,
            );

            wrapper.openPicker();
            matchTitle(wrapper, defaultPickerValueTitle[0]);
            wrapper.openPicker(1);
            matchTitle(wrapper, defaultPickerValueTitle[1]);
          });

          it('with closing value', () => {
            const wrapper = mount(
              <MomentRangePicker picker={picker as any} value={closingValue as any} />,
            );

            wrapper.openPicker();
            matchTitle(wrapper, closingValueTitle);
            wrapper.openPicker(1);
            matchTitle(wrapper, closingValueTitle);
          });

          it('with far value', () => {
            const wrapper = mount(
              <MomentRangePicker picker={picker as any} value={farValue as any} />,
            );

            wrapper.openPicker();
            matchTitle(wrapper, farValueTitle[0]);
            wrapper.openPicker(1);
            matchTitle(wrapper, farValueTitle[1]);
          });

          it('no end date', () => {
            const wrapper = mount(
              <MomentRangePicker picker={picker as any} value={[closingValue[0], null]} />,
            );

            wrapper.openPicker();
            matchTitle(wrapper, farValueTitle[0]);
            wrapper.openPicker(1);
            matchTitle(wrapper, farValueTitle[0]);
          });
        });
      },
    );

    // https://github.com/ant-design/ant-design/issues/22991
    it('click switch 1 offset', () => {
      const wrapper = mount(<MomentRangePicker />);
      wrapper.openPicker();
      expect(
        wrapper
          .find('.rc-picker-header-view')
          .first()
          .text(),
      ).toEqual('Sep1990');
      wrapper
        .find('.rc-picker-header-next-btn')
        .last()
        .simulate('click');
      expect(
        wrapper
          .find('.rc-picker-header-view')
          .first()
          .text(),
      ).toEqual('Oct1990');
    });
  });

  // https://github.com/ant-design/ant-design/issues/20868
  it('change picker should reset mode', () => {
    const wrapper = mount(<MomentRangePicker picker="date" />);
    wrapper.openPicker();
    expect(wrapper.find('DatePanel').length).toBeTruthy();

    wrapper.setProps({ picker: 'month' });
    wrapper.update();
    expect(wrapper.find('DatePanel').length).toBeFalsy();
    expect(wrapper.find('MonthPanel').length).toBeTruthy();
  });

  describe('reorder onChange logic', () => {
    it('datetime should reorder in onChange if start is after end in same date', () => {
      const onChange = jest.fn();

      const wrapper = mount(<MomentRangePicker onChange={onChange} showTime />);
      wrapper.openPicker();
      wrapper.selectCell(15);
      wrapper
        .find('ul')
        .first()
        .find('li')
        .last()
        .simulate('click');
      wrapper.find('.rc-picker-ok button').simulate('click');

      wrapper.selectCell(15);
      wrapper
        .find('ul')
        .first()
        .find('li')
        .first()
        .simulate('click');
      wrapper.find('.rc-picker-ok button').simulate('click');

      expect(onChange).toHaveBeenCalledWith(expect.anything(), [
        '1990-09-15 00:00:00',
        '1990-09-15 23:00:00',
      ]);

      expect(isSame(onChange.mock.calls[0][0][0], '1990-09-15 00:00:00')).toBeTruthy();
      expect(isSame(onChange.mock.calls[0][0][1], '1990-09-15 23:00:00')).toBeTruthy();
    });

    function testOrderOnTime(order: boolean, start: string, end: string) {
      it(`order: ${String(order)} when picker is time`, () => {
        const onChange = jest.fn();

        const wrapper = mount(
          <MomentRangePicker onChange={onChange} picker="time" order={order} />,
        );
        wrapper.openPicker();
        wrapper
          .find('ul')
          .first()
          .find('li')
          .last()
          .simulate('click');
        wrapper.find('.rc-picker-ok button').simulate('click');

        wrapper
          .find('ul')
          .first()
          .find('li')
          .at(2)
          .simulate('click');
        wrapper.find('.rc-picker-ok button').simulate('click');

        expect(onChange).toHaveBeenCalledWith(expect.anything(), [start, end]);

        expect(isSame(onChange.mock.calls[0][0][0], start)).toBeTruthy();
        expect(isSame(onChange.mock.calls[0][0][1], end)).toBeTruthy();
      });
    }

    testOrderOnTime(false, '23:00:00', '02:00:00');
    testOrderOnTime(true, '02:00:00', '23:00:00');
  });

  it('id', () => {
    const wrapper = mount(<MomentRangePicker id="bamboo" />);
    expect(
      wrapper
        .find('input')
        .first()
        .props().id,
    ).toEqual('bamboo');
  });

  it('dateRender', () => {
    let range = 'start';

    const wrapper = mount(
      <MomentRangePicker
        open
        dateRender={(date, _, info) => {
          expect(info.range).toEqual(range);
          return date.format('YYYY-MM-DD');
        }}
      />,
    );
    expect(
      wrapper
        .find('tbody td')
        .last()
        .text(),
    ).toEqual('1990-11-10');

    range = 'end';
    wrapper.openPicker(1);
  });

  // https://github.com/ant-design/ant-design/issues/21084
  it('should not jump back to current date after select', () => {
    const wrapper = mount(<MomentRangePicker />);
    wrapper.openPicker();
    wrapper.clickButton('super-prev');
    wrapper.selectCell(3);
    wrapper.selectCell(4);
    matchValues(wrapper, '1989-09-03', '1989-09-04');
  });

  describe('can select endDate when in same level', () => {
    /**
     * Selection should support in same level.
     * Like `2020-12-31` ~ `2020-01-01` is validate in `year` picker.
     */
    const list: {
      picker: PickerMode;
      defaultValue: string[];
      selectCell: string;
      match: string[];
    }[] = [
      {
        picker: 'week',
        defaultValue: ['2020-06-13'],
        selectCell: '9',
        match: ['2020-24th'],
      },
      {
        picker: 'quarter',
        defaultValue: ['2020-03-30', '2020-05-20'],
        selectCell: 'Q1',
        match: ['2020-Q1'],
      },
    ];

    list.forEach(({ picker, defaultValue, match, selectCell }) => {
      it(picker, () => {
        const onChange = jest.fn();
        const wrapper = mount(
          <MomentRangePicker
            picker={picker}
            onChange={onChange}
            defaultValue={[
              getMoment(defaultValue[0]),
              getMoment(defaultValue[1] || defaultValue[0]),
            ]}
          />,
        );
        wrapper.openPicker(1);
        wrapper.selectCell(selectCell);
        expect(onChange).toHaveBeenCalled();
        expect(onChange).toHaveBeenCalledWith(expect.anything(), [match[0], match[1] || match[0]]);
      });
    });
  });

  it('should not disabled when week picker in diff year', () => {
    const wrapper = mount(
      <MomentRangePicker
        picker="week"
        defaultValue={[getMoment('2000-12-15'), getMoment('2021-02-03')]}
      />,
    );

    wrapper.openPicker(1);
    expect(wrapper.findCell('15').hasClass('rc-picker-cell-disabled')).toBeFalsy();
  });

  it('format', () => {
    const wrapper = mount(
      <MomentRangePicker
        format={['YYYYMMDD', 'YYYY-MM-DD']}
        defaultValue={[getMoment('2000-12-15'), getMoment('2021-02-03')]}
      />,
    );

    // Start date
    wrapper.openPicker();
    wrapper
      .find('input')
      .first()
      .simulate('change', {
        target: {
          value: '1989-09-03',
        },
      });
    wrapper.closePicker();

    // end date
    wrapper.openPicker(1);
    wrapper
      .find('input')
      .last()
      .simulate('change', {
        target: {
          value: '1990-11-28',
        },
      });
    wrapper.closePicker(1);

    expect(
      wrapper
        .find('input')
        .first()
        .prop('value'),
    ).toEqual('19890903');
    expect(
      wrapper
        .find('input')
        .last()
        .prop('value'),
    ).toEqual('19901128');
  });

  describe('auto open', () => {
    it('empty: start -> end -> close', () => {
      const wrapper = mount(<MomentRangePicker />);

      wrapper.openPicker(0);
      wrapper.inputValue('1990-11-28');
      wrapper.closePicker(0);
      expect(wrapper.isOpen()).toBeTruthy();

      wrapper.inputValue('1991-01-01');
      wrapper.closePicker(1);
      expect(wrapper.isOpen()).toBeFalsy();
    });

    it('valued: start -> end -> close', () => {
      const wrapper = mount(
        <MomentRangePicker defaultValue={[getMoment('1989-01-01'), getMoment('1990-01-01')]} />,
      );

      wrapper.openPicker(0);
      wrapper.inputValue('1990-11-28');
      wrapper.closePicker(0);
      expect(wrapper.isOpen()).toBeTruthy();

      wrapper.inputValue('1990-12-23');
      wrapper.closePicker(1);
      expect(wrapper.isOpen()).toBeFalsy();
    });

    it('empty: end -> start -> close', () => {
      const wrapper = mount(<MomentRangePicker />);

      wrapper.openPicker(1);
      wrapper.inputValue('1990-11-28', 1);
      wrapper.closePicker(1);
      expect(wrapper.isOpen()).toBeTruthy();

      wrapper.inputValue('1989-01-01');
      wrapper.closePicker(0);
      expect(wrapper.isOpen()).toBeFalsy();
    });

    it('valued: end -> start -> close', () => {
      const wrapper = mount(
        <MomentRangePicker defaultValue={[getMoment('1989-01-01'), getMoment('1990-01-01')]} />,
      );

      wrapper.openPicker(1);
      wrapper.inputValue('1990-11-28', 1);
      wrapper.closePicker(1);
      expect(wrapper.isOpen()).toBeTruthy();

      wrapper.inputValue('1989-01-01');
      wrapper.closePicker(0);
      expect(wrapper.isOpen()).toBeFalsy();
    });

    it('not change: start not to end', () => {
      const wrapper = mount(
        <MomentRangePicker defaultValue={[getMoment('1989-01-01'), getMoment('1990-01-01')]} />,
      );
      wrapper.openPicker(0);
      wrapper.closePicker(0);
      expect(wrapper.isOpen()).toBeFalsy();
    });
  });

  describe('click at non-input elements', () => {
    it('should open when click suffix', () => {
      const wrapper = mount(<MomentRangePicker suffixIcon="o" />);
      wrapper.find('.rc-picker-suffix').simulate('click');
      expect(wrapper.isOpen()).toBeTruthy();
    });
    it('should open when click seperator', () => {
      const wrapper = mount(<MomentRangePicker suffixIcon="o" />);
      wrapper.find('.rc-picker-range-separator').simulate('click');
      expect(wrapper.isOpen()).toBeTruthy();
    });
    it('should focus on the first element', () => {
      jest.useFakeTimers();
      const wrapper = mount(<MomentRangePicker suffixIcon="o" />);
      wrapper.find('.rc-picker-suffix').simulate('click');
      jest.runAllTimers();
      expect(document.activeElement).toStrictEqual(
        wrapper
          .find('input')
          .first()
          .getDOMNode(),
      );
      jest.useRealTimers();
    });
    it('should focus on the second element if first is disabled', () => {
      jest.useFakeTimers();
      const wrapper = mount(<MomentRangePicker suffixIcon="o" disabled={[true, false]} />);
      wrapper.find('.rc-picker-suffix').simulate('click');
      jest.runAllTimers();
      expect(document.activeElement).toStrictEqual(
        wrapper
          .find('input')
          .last()
          .getDOMNode(),
      );
      jest.useRealTimers();
    });
    it("shouldn't let mousedown blur the input", () => {
      jest.useFakeTimers();
      const preventDefault = jest.fn();
      const wrapper = mount(<MomentRangePicker suffixIcon="o" />, {
        attachTo: document.body,
      });
      wrapper.find('.rc-picker-suffix').simulate('click');
      jest.runAllTimers();
      wrapper.find('.rc-picker-suffix').simulate('mousedown', {
        preventDefault,
      });
      expect(preventDefault).toHaveBeenCalled();
      jest.useRealTimers();
    });
  });
});

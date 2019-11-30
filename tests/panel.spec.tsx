import React from 'react';
import MockDate from 'mockdate';
import moment from 'moment';
import { resetWarned } from 'rc-util/lib/warning';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import { mount, getMoment, isSame, MomentPickerPanel } from './util/commonUtil';

describe('Panel', () => {
  beforeAll(() => {
    MockDate.set(getMoment('1990-09-03 00:00:00').toDate());
  });

  afterAll(() => {
    MockDate.reset();
  });

  describe('value', () => {
    it('defaultValue', () => {
      const wrapper = mount(
        <MomentPickerPanel defaultValue={getMoment('2000-01-01')} />,
      );

      expect(wrapper.find('.rc-picker-cell-selected').text()).toEqual('1');
    });

    it('controlled', () => {
      const onChange = jest.fn();
      const wrapper = mount(
        <MomentPickerPanel
          value={getMoment('2000-01-01')}
          onChange={onChange}
        />,
      );

      wrapper.selectCell(23);
      expect(isSame(onChange.mock.calls[0][0], '2000-01-23')).toBeTruthy();
      onChange.mockReset();

      // Trigger again since value is controlled
      wrapper.selectCell(23);
      expect(isSame(onChange.mock.calls[0][0], '2000-01-23')).toBeTruthy();
      onChange.mockReset();

      // Not trigger
      wrapper.setProps({ value: getMoment('2000-01-23') });
      wrapper.selectCell(23);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('uncontrolled', () => {
      const onChange = jest.fn();
      const wrapper = mount(<MomentPickerPanel onChange={onChange} />);

      wrapper.selectCell(23);
      expect(isSame(onChange.mock.calls[0][0], '1990-09-23')).toBeTruthy();
      onChange.mockReset();

      // Not trigger
      wrapper.selectCell(23);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Panel switch by picker', () => {
    it('year', () => {
      const wrapper = mount(<MomentPickerPanel picker="year" />);
      wrapper.find('.rc-picker-decade-btn').simulate('click');
      expect(wrapper.find('.rc-picker-decade-panel').length).toBeTruthy();

      wrapper.selectCell('1990-1999');
      expect(wrapper.find('.rc-picker-year-panel').length).toBeTruthy();

      wrapper.selectCell('1999');
      expect(wrapper.find('.rc-picker-year-panel').length).toBeTruthy();
    });

    it('month', () => {
      const wrapper = mount(<MomentPickerPanel picker="month" />);
      wrapper.find('.rc-picker-year-btn').simulate('click');
      wrapper.find('.rc-picker-decade-btn').simulate('click');
      expect(wrapper.find('.rc-picker-decade-panel').length).toBeTruthy();

      wrapper.selectCell('1990-1999');
      expect(wrapper.find('.rc-picker-year-panel').length).toBeTruthy();

      wrapper.selectCell('1999');
      expect(wrapper.find('.rc-picker-month-panel').length).toBeTruthy();

      wrapper.selectCell('Aug');
      expect(wrapper.find('.rc-picker-month-panel').length).toBeTruthy();
    });
  });

  describe('time click to scroll', () => {
    let domSpy: ReturnType<typeof spyElementPrototypes>;
    const requestAnimationFrameSpy = jest.spyOn(
      global,
      'requestAnimationFrame' as any,
    );

    beforeEach(() => {
      let scrollTop = 90;

      domSpy = spyElementPrototypes(HTMLElement, {
        scrollTop: {
          get: () => scrollTop,
          set: ((_: Function, value: number) => {
            scrollTop = value;
          }) as any,
        },
      });
    });
    afterEach(() => {
      domSpy.mockRestore();
    });

    it('scroll', () => {
      jest.useFakeTimers();
      const wrapper = mount(<MomentPickerPanel mode="time" />);

      // Multiple times should only one work
      wrapper
        .find('ul')
        .first()
        .find('li')
        .at(3)
        .simulate('click');

      wrapper
        .find('ul')
        .first()
        .find('li')
        .at(11)
        .simulate('click');
      jest.runAllTimers();

      expect(requestAnimationFrameSpy).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  describe('click button to switch', () => {
    it('date', () => {
      const wrapper = mount(
        <MomentPickerPanel defaultValue={getMoment('1990-09-03')} />,
      );

      wrapper.clickButton('prev');
      expect(wrapper.find('.rc-picker-header-view').text()).toEqual('Aug1990');

      wrapper.clickButton('next');
      expect(wrapper.find('.rc-picker-header-view').text()).toEqual('Sep1990');

      wrapper.clickButton('super-prev');
      expect(wrapper.find('.rc-picker-header-view').text()).toEqual('Sep1989');

      wrapper.clickButton('super-next');
      expect(wrapper.find('.rc-picker-header-view').text()).toEqual('Sep1990');
    });

    it('month', () => {
      const wrapper = mount(
        <MomentPickerPanel
          defaultValue={getMoment('1990-09-03')}
          picker="month"
        />,
      );

      wrapper.clickButton('super-prev');
      expect(wrapper.find('.rc-picker-header-view').text()).toEqual('1989');

      wrapper.clickButton('super-next');
      expect(wrapper.find('.rc-picker-header-view').text()).toEqual('1990');
    });

    it('year', () => {
      const wrapper = mount(
        <MomentPickerPanel
          defaultValue={getMoment('1990-09-03')}
          picker="year"
        />,
      );

      wrapper.clickButton('super-prev');
      expect(wrapper.find('.rc-picker-header-view').text()).toEqual(
        '1980-1989',
      );

      wrapper.clickButton('super-next');
      expect(wrapper.find('.rc-picker-header-view').text()).toEqual(
        '1990-1999',
      );
    });

    it('decade', () => {
      const wrapper = mount(
        <MomentPickerPanel
          defaultValue={getMoment('1990-09-03')}
          mode="decade"
        />,
      );

      wrapper.clickButton('super-prev');
      expect(wrapper.find('.rc-picker-header-view').text()).toEqual(
        '1800-1899',
      );

      wrapper.clickButton('super-next');
      expect(wrapper.find('.rc-picker-header-view').text()).toEqual(
        '1900-1999',
      );
    });
  });

  // This test is safe to remove
  it('showtime', () => {
    const onSelect = jest.fn();
    const wrapper = mount(
      <MomentPickerPanel
        showTime={{
          hideDisabledOptions: true,
          showSecond: false,
          defaultValue: getMoment('2001-01-02 01:03:07'),
          disabledHours: () => [0, 1, 2, 3],
        }}
        defaultValue={getMoment('2001-01-02 01:03:07')}
        value={null}
        onSelect={onSelect}
      />,
    );

    expect(wrapper.find('.rc-picker-time-panel-column')).toHaveLength(2);
    expect(
      wrapper
        .find('.rc-picker-time-panel-column')
        .first()
        .find('li')
        .first()
        .text(),
    ).toEqual('04');

    // Click on date
    wrapper.selectCell(5);
    expect(
      isSame(onSelect.mock.calls[0][0], '1990-09-05 01:03:07'),
    ).toBeTruthy();

    // Click on time
    onSelect.mockReset();
    wrapper
      .find('ul')
      .first()
      .find('li')
      .at(11)
      .simulate('click');
    expect(
      isSame(onSelect.mock.calls[0][0], '2001-01-02 11:00:00'),
    ).toBeTruthy();
  });

  describe('not trigger onSelect when cell disabled', () => {
    it('time', () => {
      const onSelect = jest.fn();
      const wrapper = mount(
        <MomentPickerPanel
          mode="time"
          onSelect={onSelect}
          disabledHours={() => [0]}
        />,
      );

      // Disabled
      wrapper
        .find('li')
        .first()
        .simulate('click');
      expect(onSelect).not.toHaveBeenCalled();

      // Enabled
      wrapper
        .find('li')
        .at(1)
        .simulate('click');
      expect(onSelect).toHaveBeenCalled();
    });

    it('month', () => {
      const onSelect = jest.fn();
      const wrapper = mount(
        <MomentPickerPanel
          picker="month"
          onSelect={onSelect}
          disabledDate={date => date.month() === 0}
        />,
      );

      wrapper.selectCell('Jan');
      expect(onSelect).not.toHaveBeenCalled();

      wrapper.selectCell('Feb');
      expect(onSelect).toHaveBeenCalled();
    });

    it('year', () => {
      const onSelect = jest.fn();
      const wrapper = mount(
        <MomentPickerPanel
          picker="year"
          onSelect={onSelect}
          disabledDate={date => date.year() === 1990}
        />,
      );

      wrapper.selectCell(1990);
      expect(onSelect).not.toHaveBeenCalled();

      wrapper.selectCell(1993);
      expect(onSelect).toHaveBeenCalled();
    });

    it('decade', () => {
      const onSelect = jest.fn();
      const wrapper = mount(
        <MomentPickerPanel
          mode="decade"
          onSelect={onSelect}
          disabledDate={date => date.year() === 1900}
        />,
      );

      wrapper.selectCell('1900-1909');
      expect(onSelect).not.toHaveBeenCalled();

      wrapper.selectCell('1910-1919');
      expect(onSelect).toHaveBeenCalled();
    });
  });

  it('time with use12Hours', () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <MomentPickerPanel
        picker="time"
        defaultValue={getMoment('2000-01-01 00:01:02')}
        use12Hours
        onChange={onChange}
      />,
    );

    wrapper
      .find('.rc-picker-time-panel-column')
      .last()
      .find('li')
      .last()
      .simulate('click');
    expect(
      isSame(onChange.mock.calls[0][0], '2000-01-01 12:01:02', 'second'),
    ).toBeTruthy();
  });

  it('time disabled columns', () => {
    const wrapper = mount(
      <MomentPickerPanel
        mode="time"
        disabledHours={() => [0, 1, 2, 3, 4, 5, 6, 7]}
        disabledMinutes={() => [2, 4, 6, 8, 10]}
        disabledSeconds={() => [10, 20, 30, 40, 50]}
      />,
    );

    expect(wrapper.render()).toMatchSnapshot();
  });

  it('warning with invalidate value', () => {
    resetWarned();
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const invalidateDate = moment('notValidate', 'YYYY', true);
    mount(<MomentPickerPanel value={invalidateDate} />);
    expect(errSpy).toHaveBeenCalledWith(
      'Warning: Invalidate date pass to `value`.',
    );

    mount(<MomentPickerPanel defaultValue={invalidateDate} />);
    expect(errSpy).toHaveBeenCalledWith(
      'Warning: Invalidate date pass to `defaultValue`.',
    );

    errSpy.mockRestore();
  });

  describe('hideHeader', () => {
    ['decade', 'year', 'month', 'date', 'time'].forEach(mode => {
      it(mode, () => {
        const wrapper = mount(
          <MomentPickerPanel mode={mode as any} hideHeader />,
        );
        expect(wrapper.find('.rc-picker-header')).toHaveLength(0);
      });
    });
  });
});

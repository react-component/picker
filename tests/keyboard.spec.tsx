import React from 'react';
import MockDate from 'mockdate';
import KeyCode from 'rc-util/lib/KeyCode';
import {
  mount,
  getMoment,
  isSame,
  MomentPicker,
  MomentPickerPanel,
  Wrapper,
} from './util/commonUtil';

describe('Keyboard', () => {
  function panelKeyDown(wrapper: Wrapper, keyCode: number, info?: object) {
    wrapper
      .find('.rc-picker-panel')
      .simulate('keyDown', { which: keyCode, ...info });
  }

  beforeAll(() => {
    MockDate.set(getMoment('1990-09-03 00:00:00').toDate());
  });

  afterAll(() => {
    MockDate.reset();
  });

  it('open to select', () => {
    const onChange = jest.fn();
    const onSelect = jest.fn();
    const wrapper = mount(
      <MomentPicker onSelect={onSelect} onChange={onChange} />,
    );
    wrapper.find('input').simulate('focus');
    wrapper.keyDown(KeyCode.ENTER);
    expect(wrapper.isOpen()).toBeTruthy();

    // Tab to operate popup panel
    wrapper.keyDown(KeyCode.TAB);
    expect(wrapper.find('.rc-picker-panel-focused').length).toBeTruthy();

    // Down
    wrapper.keyDown(KeyCode.DOWN);
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-10')).toBeTruthy();

    // UP
    onSelect.mockReset();
    wrapper.keyDown(KeyCode.UP);
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-03')).toBeTruthy();

    // LEFT
    onSelect.mockReset();
    wrapper.keyDown(KeyCode.LEFT);
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-02')).toBeTruthy();

    // RIGHT
    onSelect.mockReset();
    wrapper.keyDown(KeyCode.RIGHT);
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-03')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();

    // Control + Left
    onSelect.mockReset();
    wrapper.keyDown(KeyCode.LEFT, { ctrlKey: true });
    expect(isSame(onSelect.mock.calls[0][0], '1989-09-03')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();

    // Control + RIGHT
    onSelect.mockReset();
    wrapper.keyDown(KeyCode.RIGHT, { ctrlKey: true });
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-03')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();

    // PageUp
    onSelect.mockReset();
    wrapper.keyDown(KeyCode.PAGE_UP);
    expect(isSame(onSelect.mock.calls[0][0], '1990-08-03')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();

    // PageDown
    onSelect.mockReset();
    wrapper.keyDown(KeyCode.PAGE_DOWN);
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-03')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();

    // Other key
    onSelect.mockReset();
    wrapper.keyDown(KeyCode.B);
    expect(onSelect).not.toHaveBeenCalled();

    // Double RIGHT
    wrapper.keyDown(KeyCode.RIGHT);

    // ENTER
    wrapper.keyDown(KeyCode.ENTER);
    expect(wrapper.isOpen()).toBeFalsy();
    expect(onChange.mock.calls[0][1]).toEqual('1990-09-04');
  });

  it('ESC to cancel', () => {
    const onChange = jest.fn();
    const wrapper = mount(<MomentPicker onChange={onChange} />);
    wrapper.openPicker();

    // Change value
    wrapper.keyDown(KeyCode.TAB);
    wrapper.keyDown(KeyCode.DOWN);

    // ESC
    wrapper.keyDown(KeyCode.ESC);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('any key to open', () => {
    const wrapper = mount(<MomentPicker />);
    wrapper.keyDown(KeyCode.A);
    expect(wrapper.isOpen()).toBeTruthy();
  });

  it('not change focus to panel', () => {
    const wrapper = mount(<MomentPicker />);
    wrapper.openPicker();

    // Not change focus
    wrapper.keyDown(KeyCode.B);
    expect(wrapper.isOpen()).toBeTruthy();

    expect(wrapper.find('.rc-picker-panel-focused').length).toBeFalsy();
  });

  it('Tab into Panel and back to input', () => {
    const wrapper = mount(<MomentPicker />);
    wrapper.openPicker();

    // Focus Panel
    wrapper.keyDown(KeyCode.TAB);
    expect(wrapper.find('.rc-picker-panel-focused').length).toBeTruthy();

    // Focus Back
    wrapper.keyDown(KeyCode.TAB, { shiftKey: true });
    expect(wrapper.find('.rc-picker-panel-focused').length).toBeFalsy();
  });

  describe('datetime Tab control', () => {
    it('Picker', () => {
      const wrapper = mount(<MomentPicker showTime />);
      wrapper.openPicker();

      // Focus Panel
      wrapper.keyDown(KeyCode.TAB);
      expect(wrapper.find('.rc-picker-panel-focused').length).toBeTruthy();

      // Focus Date Panel
      wrapper.keyDown(KeyCode.TAB);
      expect(wrapper.find('.rc-picker-date-panel-active').length).toBeTruthy();

      // Focus Time Panel
      wrapper.keyDown(KeyCode.TAB);
      expect(wrapper.find('.rc-picker-time-panel-active').length).toBeTruthy();

      // Close should not focus
      wrapper.closePicker();
      expect(wrapper.find('.rc-picker-time-panel-active').length).toBeFalsy();
    });

    describe('PickerPanel', () => {
      describe('switch panels', () => {
        [
          {
            name: 'Tab switch first',
            operate: (wrapper: Wrapper) => {
              panelKeyDown(wrapper, KeyCode.TAB);
            },
          },
          {
            name: 'Arrow switch first',
            operate: (wrapper: Wrapper) => {
              // Nothing happen
              panelKeyDown(wrapper, KeyCode.A);

              // Switch
              panelKeyDown(wrapper, KeyCode.DOWN);
            },
          },
        ].forEach(({ name, operate }) => {
          it(name, () => {
            const onSelect = jest.fn();
            const wrapper = mount(
              <MomentPickerPanel onSelect={onSelect} showTime />,
            );

            // Focus Panel
            wrapper.find('.rc-picker-panel').simulate('focus');

            // Focus Date Panel
            operate(wrapper);
            expect(
              wrapper.find('.rc-picker-date-panel-active').length,
            ).toBeTruthy();

            // Select
            panelKeyDown(wrapper, KeyCode.DOWN);
            expect(
              isSame(onSelect.mock.calls[0][0], '1990-09-10'),
            ).toBeTruthy();

            // Focus Time Panel
            panelKeyDown(wrapper, KeyCode.TAB);
            expect(
              wrapper.find('.rc-picker-time-panel-active').length,
            ).toBeTruthy();

            // Select
            onSelect.mockReset();
            panelKeyDown(wrapper, KeyCode.UP);
            panelKeyDown(wrapper, KeyCode.DOWN);
            expect(
              isSame(
                onSelect.mock.calls[0][0],
                '1990-09-10 01:00:00',
                'second',
              ),
            ).toBeTruthy();

            // Next column select
            onSelect.mockReset();
            panelKeyDown(wrapper, KeyCode.RIGHT);
            panelKeyDown(wrapper, KeyCode.UP);
            expect(
              isSame(
                onSelect.mock.calls[0][0],
                '1990-09-10 01:59:00',
                'second',
              ),
            ).toBeTruthy();

            // Enter to exit column edit
            onSelect.mockReset();
            expect(
              wrapper.find('.rc-picker-time-panel-column-active').length,
            ).toBeTruthy();
            panelKeyDown(wrapper, KeyCode.ENTER);
            expect(
              wrapper.find('.rc-picker-time-panel-column-active').length,
            ).toBeFalsy();
            expect(
              isSame(
                onSelect.mock.calls[0][0],
                '1990-09-10 01:59:00',
                'second',
              ),
            ).toBeTruthy();

            // Close should not focus
            wrapper.find('.rc-picker-panel').simulate('blur');
            expect(
              wrapper.find('.rc-picker-time-panel-active').length,
            ).toBeFalsy();
          });
        });
      });

      it('Enter to next view', () => {
        const wrapper = mount(<MomentPickerPanel />);
        wrapper.find('.rc-picker-date-panel-year-btn').simulate('click');
        wrapper.find('.rc-picker-year-panel-decade-btn').simulate('click');

        // Decade
        expect(wrapper.find('.rc-picker-decade-panel').length).toBeTruthy();

        // Year
        panelKeyDown(wrapper, KeyCode.ENTER);
        expect(wrapper.find('.rc-picker-year-panel').length).toBeTruthy();

        // Month
        panelKeyDown(wrapper, KeyCode.ENTER);
        expect(wrapper.find('.rc-picker-month-panel').length).toBeTruthy();

        // Date
        panelKeyDown(wrapper, KeyCode.ENTER);
        expect(wrapper.find('.rc-picker-date-panel').length).toBeTruthy();
      });
    });
  });

  it('time enter will trigger onSelect', () => {
    const onSelect = jest.fn();
    const wrapper = mount(
      <MomentPickerPanel picker="time" onSelect={onSelect} />,
    );
    panelKeyDown(wrapper, KeyCode.ENTER);
    expect(
      isSame(onSelect.mock.calls[0][0], '1990-09-03 00:00:00', 'second'),
    ).toBeTruthy();
  });

  describe('arrow trigger onSelect', () => {
    // Same as 'open to select' test. But with other panel
    it('month', () => {
      const onSelect = jest.fn();
      const wrapper = mount(
        <MomentPickerPanel
          picker="month"
          defaultValue={getMoment('1990-09-03')}
          onSelect={onSelect}
        />,
      );

      // Left
      panelKeyDown(wrapper, KeyCode.LEFT);
      expect(isSame(onSelect.mock.calls[0][0], '1990-08-03')).toBeTruthy();

      // Control + Right
      onSelect.mockReset();
      panelKeyDown(wrapper, KeyCode.RIGHT, { ctrlKey: true });
      expect(isSame(onSelect.mock.calls[0][0], '1991-08-03')).toBeTruthy();

      // Down
      onSelect.mockReset();
      panelKeyDown(wrapper, KeyCode.DOWN);
      expect(isSame(onSelect.mock.calls[0][0], '1991-11-03')).toBeTruthy();
    });
  });
});

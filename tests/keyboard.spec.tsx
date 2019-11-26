import React from 'react';
import MockDate from 'mockdate';
import KeyCode from 'rc-util/lib/KeyCode';
import {
  mount,
  getMoment,
  isSame,
  MomentPicker,
  MomentPickerPanel,
} from './util/commonUtil';

describe('Keyboard', () => {
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

    it('PickerPanel', () => {
      const wrapper = mount(<MomentPickerPanel showTime />);

      // Focus Panel
      wrapper.find('.rc-picker-panel').simulate('focus');

      // Focus Date Panel
      wrapper
        .find('.rc-picker-panel')
        .simulate('keyDown', { which: KeyCode.TAB });
      expect(wrapper.find('.rc-picker-date-panel-active').length).toBeTruthy();

      // Focus Time Panel
      wrapper
        .find('.rc-picker-panel')
        .simulate('keyDown', { which: KeyCode.TAB });
      expect(wrapper.find('.rc-picker-time-panel-active').length).toBeTruthy();

      // Close should not focus
      wrapper.find('.rc-picker-panel').simulate('blur');
      expect(wrapper.find('.rc-picker-time-panel-active').length).toBeFalsy();
    });
  });
});

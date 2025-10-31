import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Picker, RangePicker } from '../src';
import dayGenerateConfig from '../src/generate/dayjs';
import enUS from '../src/locale/en_US';
import { getDay, openPicker, waitFakeTimer } from './util/commonUtil';

describe('Picker.ManualClear', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(getDay('1990-09-03 00:00:00').valueOf());
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Single Picker', () => {
    it('should trigger onChange when manually clearing input', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <Picker
          generateConfig={dayGenerateConfig}
          value={getDay('2023-08-01')}
          onChange={onChange}
          locale={enUS}
          allowClear
        />,
      );

      const input = container.querySelector('input') as HTMLInputElement;

      openPicker(container);
      fireEvent.change(input, { target: { value: '' } });

      await waitFakeTimer();

      expect(onChange).toHaveBeenCalledWith(null, null);
    });

    it('should NOT clear when allowClear is disabled - reset to previous value', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <Picker
          generateConfig={dayGenerateConfig}
          value={getDay('2023-08-01')}
          onChange={onChange}
          locale={enUS}
          allowClear={false}
        />,
      );

      const input = container.querySelector('input') as HTMLInputElement;

      expect(input.value).toBe('2023-08-01');

      openPicker(container);
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);

      await waitFakeTimer();

      expect(onChange).not.toHaveBeenCalled();
      expect(input.value).toBe('2023-08-01');
    });

    it('should reset invalid partial input on blur without triggering onChange', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <Picker
          generateConfig={dayGenerateConfig}
          value={getDay('2023-08-01')}
          onChange={onChange}
          locale={enUS}
          format="YYYY-MM-DD"
        />,
      );

      const input = container.querySelector('input') as HTMLInputElement;

      openPicker(container);

      const initialOnChangeCallCount = onChange.mock.calls.length;

      fireEvent.blur(input);
      await waitFakeTimer();

      expect(onChange.mock.calls.length).toBe(initialOnChangeCallCount);
      expect(input.value).toBe('2023-08-01');
    });

    it('should work with different picker modes', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <Picker
          generateConfig={dayGenerateConfig}
          value={getDay('2023-08-01')}
          onChange={onChange}
          locale={enUS}
          picker="month"
          allowClear
        />,
      );

      const input = container.querySelector('input') as HTMLInputElement;

      openPicker(container);
      fireEvent.change(input, { target: { value: '' } });

      await waitFakeTimer();

      expect(onChange).toHaveBeenCalledWith(null, null);
    });

    it('should clear input value when manually clearing', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <Picker
          generateConfig={dayGenerateConfig}
          value={getDay('2023-08-01')}
          onChange={onChange}
          locale={enUS}
          allowClear
        />,
      );

      const input = container.querySelector('input') as HTMLInputElement;

      expect(input.value).toBe('2023-08-01');

      openPicker(container);
      fireEvent.change(input, { target: { value: '' } });

      await waitFakeTimer();

      expect(input.value).toBe('');
    });

    it('should clear formatted input with mask format', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <Picker
          generateConfig={dayGenerateConfig}
          value={getDay('2023-08-01')}
          onChange={onChange}
          locale={enUS}
          format={{ type: 'mask', format: 'YYYY-MM-DD' }}
          allowClear
        />,
      );

      const input = container.querySelector('input') as HTMLInputElement;

      openPicker(container);
      fireEvent.change(input, { target: { value: '' } });

      await waitFakeTimer();

      expect(onChange).toHaveBeenCalledWith(null, null);
      expect(input.value).toBe('');
    });
  });

  describe('Range Picker', () => {
    it('should clear start input value when manually clearing', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <RangePicker
          generateConfig={dayGenerateConfig}
          value={[getDay('2023-08-01'), getDay('2023-08-15')]}
          onChange={onChange}
          locale={enUS}
          needConfirm={false}
          allowClear
        />,
      );

      const startInput = container.querySelectorAll('input')[0] as HTMLInputElement;

      openPicker(container, 0);
      fireEvent.change(startInput, { target: { value: '' } });
      fireEvent.blur(startInput);

      await waitFakeTimer();

      expect(startInput.value).toBe('');
    });

    it('should clear end input value when manually clearing', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <RangePicker
          generateConfig={dayGenerateConfig}
          value={[getDay('2023-08-01'), getDay('2023-08-15')]}
          onChange={onChange}
          locale={enUS}
          needConfirm={false}
          allowClear
        />,
      );

      const endInput = container.querySelectorAll('input')[1] as HTMLInputElement;

      openPicker(container, 1);
      fireEvent.change(endInput, { target: { value: '' } });
      fireEvent.blur(endInput);

      await waitFakeTimer();

      expect(endInput.value).toBe('');
    });

    it('should clear both input values when manually clearing', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <RangePicker
          generateConfig={dayGenerateConfig}
          value={[getDay('2023-08-01'), getDay('2023-08-15')]}
          onChange={onChange}
          locale={enUS}
          needConfirm={false}
          allowClear
        />,
      );

      const startInput = container.querySelectorAll('input')[0] as HTMLInputElement;
      const endInput = container.querySelectorAll('input')[1] as HTMLInputElement;

      openPicker(container, 0);
      fireEvent.change(startInput, { target: { value: '' } });
      fireEvent.blur(startInput);
      await waitFakeTimer();

      openPicker(container, 1);
      fireEvent.change(endInput, { target: { value: '' } });
      fireEvent.blur(endInput);
      await waitFakeTimer();

      expect(startInput.value).toBe('');
      expect(endInput.value).toBe('');
    });

    it('should clear input values when manually clearing', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <RangePicker
          generateConfig={dayGenerateConfig}
          value={[getDay('2023-08-01'), getDay('2023-08-15')]}
          onChange={onChange}
          locale={enUS}
          allowClear
        />,
      );

      const startInput = container.querySelectorAll('input')[0] as HTMLInputElement;

      expect(startInput.value).toBe('2023-08-01');

      openPicker(container, 0);
      fireEvent.change(startInput, { target: { value: '' } });

      await waitFakeTimer();

      expect(startInput.value).toBe('');
    });
  });

  describe('Comparison with clear button', () => {
    it('manual clear should behave the same as clear button for Picker', async () => {
      const onChangeManual = jest.fn();
      const onChangeClear = jest.fn();

      const { container: container1 } = render(
        <Picker
          generateConfig={dayGenerateConfig}
          value={getDay('2023-08-01')}
          onChange={onChangeManual}
          locale={enUS}
          allowClear
        />,
      );

      const input1 = container1.querySelector('input') as HTMLInputElement;
      openPicker(container1);
      fireEvent.change(input1, { target: { value: '' } });
      await waitFakeTimer();

      const { container: container2 } = render(
        <Picker
          generateConfig={dayGenerateConfig}
          value={getDay('2023-08-01')}
          onChange={onChangeClear}
          locale={enUS}
          allowClear
        />,
      );

      const clearBtn = container2.querySelector('.rc-picker-clear');
      fireEvent.mouseDown(clearBtn);
      fireEvent.mouseUp(clearBtn);
      fireEvent.click(clearBtn);
      await waitFakeTimer();

      expect(onChangeManual).toHaveBeenCalledWith(null, null);
      expect(onChangeClear).toHaveBeenCalledWith(null, null);
    });
  });
});

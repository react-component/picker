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
    it('should trigger onChange when manually clearing input (select all + delete)', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <Picker
          generateConfig={dayGenerateConfig}
          value={getDay('2023-08-01')}
          onChange={onChange}
          locale={enUS}
        />,
      );

      const input = container.querySelector('input') as HTMLInputElement;

      openPicker(container);
      input.setSelectionRange(0, input.value.length);
      fireEvent.keyDown(input, { key: 'Delete', code: 'Delete' });

      await waitFakeTimer();

      expect(onChange).toHaveBeenCalledWith(null, null);
    });

    it('should trigger onChange when manually clearing input (select all + backspace)', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <Picker
          generateConfig={dayGenerateConfig}
          value={getDay('2023-08-01')}
          onChange={onChange}
          locale={enUS}
        />,
      );

      const input = container.querySelector('input') as HTMLInputElement;

      openPicker(container);
      input.setSelectionRange(0, input.value.length);
      fireEvent.keyDown(input, { key: 'Backspace', code: 'Backspace' });

      await waitFakeTimer();

      expect(onChange).toHaveBeenCalledWith(null, null);
    });

    it('should trigger onChange when manually clearing via input change event', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <Picker
          generateConfig={dayGenerateConfig}
          value={getDay('2023-08-01')}
          onChange={onChange}
          locale={enUS}
        />,
      );

      const input = container.querySelector('input') as HTMLInputElement;

      openPicker(container);
      fireEvent.change(input, { target: { value: '' } });

      await waitFakeTimer();

      expect(onChange).toHaveBeenCalledWith(null, null);
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
        />,
      );

      const input = container.querySelector('input') as HTMLInputElement;

      openPicker(container);
      input.setSelectionRange(0, input.value.length);
      fireEvent.keyDown(input, { key: 'Delete', code: 'Delete' });

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
        />,
      );

      const input = container.querySelector('input') as HTMLInputElement;

      expect(input.value).toBe('2023-08-01');

      // Open picker
      openPicker(container);

      // Simulate selecting all text and delete
      input.setSelectionRange(0, input.value.length);
      fireEvent.keyDown(input, { key: 'Delete', code: 'Delete' });

      await waitFakeTimer();

      // Input should be empty
      expect(input.value).toBe('');
    });
  });

  describe('Range Picker', () => {
    it('should trigger onChange when manually clearing start input', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <RangePicker
          generateConfig={dayGenerateConfig}
          value={[getDay('2023-08-01'), getDay('2023-08-15')]}
          onChange={onChange}
          locale={enUS}
          needConfirm={false}
        />,
      );

      const startInput = container.querySelectorAll('input')[0] as HTMLInputElement;

      openPicker(container, 0);
      startInput.setSelectionRange(0, startInput.value.length);
      fireEvent.keyDown(startInput, { key: 'Delete', code: 'Delete' });
      fireEvent.blur(startInput);

      await waitFakeTimer();

      expect(startInput.value).toBe('');
    });

    it('should trigger onChange when manually clearing end input', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <RangePicker
          generateConfig={dayGenerateConfig}
          value={[getDay('2023-08-01'), getDay('2023-08-15')]}
          onChange={onChange}
          locale={enUS}
          needConfirm={false}
        />,
      );

      const endInput = container.querySelectorAll('input')[1] as HTMLInputElement;

      openPicker(container, 1);
      endInput.setSelectionRange(0, endInput.value.length);
      fireEvent.keyDown(endInput, { key: 'Delete', code: 'Delete' });
      fireEvent.blur(endInput);

      await waitFakeTimer();

      expect(endInput.value).toBe('');
    });

    it('should trigger onChange when manually clearing both inputs', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <RangePicker
          generateConfig={dayGenerateConfig}
          value={[getDay('2023-08-01'), getDay('2023-08-15')]}
          onChange={onChange}
          locale={enUS}
          needConfirm={false}
        />,
      );

      const startInput = container.querySelectorAll('input')[0] as HTMLInputElement;
      const endInput = container.querySelectorAll('input')[1] as HTMLInputElement;

      openPicker(container, 0);
      startInput.setSelectionRange(0, startInput.value.length);
      fireEvent.keyDown(startInput, { key: 'Delete', code: 'Delete' });
      fireEvent.blur(startInput);
      await waitFakeTimer();

      openPicker(container, 1);
      endInput.setSelectionRange(0, endInput.value.length);
      fireEvent.keyDown(endInput, { key: 'Delete', code: 'Delete' });
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
        />,
      );

      const startInput = container.querySelectorAll('input')[0] as HTMLInputElement;

      expect(startInput.value).toBe('2023-08-01');

      openPicker(container, 0);
      startInput.setSelectionRange(0, startInput.value.length);
      fireEvent.keyDown(startInput, { key: 'Delete', code: 'Delete' });

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
      input1.setSelectionRange(0, input1.value.length);
      fireEvent.keyDown(input1, { key: 'Delete', code: 'Delete' });
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

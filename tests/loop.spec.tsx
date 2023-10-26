import { render } from '@testing-library/react';
import dayjs from 'dayjs';
import { resetWarned } from 'rc-util/lib/warning';
import React from 'react';
import dayJsGenerate from '../src/generate/dayjs';
import zhCN from '../src/locale/zh_CN';
import RangePicker from '../src/RangePicker';
import { getMoment } from './util/commonUtil';

describe('Picker.Loop', () => {
  let errorSpy;

  beforeAll(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  beforeEach(() => {
    errorSpy.mockReset();
    resetWarned();
    global.scrollCalled = false;
    jest.useFakeTimers().setSystemTime(getMoment('1990-09-03 00:00:00').valueOf());
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('no loop warning', () => {
    render(
      <RangePicker locale={zhCN} generateConfig={dayJsGenerate} value={[dayjs(''), dayjs('')]} />,
    );

    expect(errorSpy).not.toHaveBeenCalled();
  });
});

import MockDate from 'mockdate';
import dayjsGenerateConfig from '../src/generate/dayjs';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const CN = 'Asia/Shanghai';
const JP = 'Asia/Tokyo';

beforeEach(() => {
  MockDate.set(dayjs.tz('2024-09-23 05:02:03.172', CN).toDate());
});

afterEach(() => {
  dayjs.tz.setDefault();
  MockDate.reset();
});

describe('dayjs: getNow', () => {
  it('normal', () => {
    const now = new Date();
    expect(now.toDateString()).toEqual('Mon Sep 23 2024');
    expect(now.toTimeString()).toContain('05:02:03 GMT+0800');
  });

  it('should be work', async () => {
    dayjs.tz.setDefault(JP);
    const now = dayjsGenerateConfig.getNow();
    const L_now = dayjs();
    expect(L_now.format()).toEqual('2024-09-23T05:02:03+08:00');
    expect(now.format()).toEqual('2024-09-23T06:02:03+09:00');
  });
});

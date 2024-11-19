import MockDate from 'mockdate';
import dayjsGenerateConfig from '../src/generate/dayjs';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import moment from 'moment-timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const CN = 'Asia/Shanghai';
const JP = 'Asia/Tokyo';

beforeEach(() => {
  MockDate.set(new Date());
  dayjs.tz.setDefault(CN);
  moment.tz.setDefault(CN);
});

afterEach(() => {
  dayjs.tz.setDefault();
  moment.tz.setDefault();
  MockDate.reset();
});

describe('dayjs: getNow', () => {
  it('normal', () => {
    const D_now = dayjsGenerateConfig.getNow();
    const M_now = moment();

    expect(D_now.format()).toEqual(M_now.format());
  });

  it('should work normally in timezone', async () => {
    dayjs.tz.setDefault(JP);
    const D_now = dayjsGenerateConfig.getNow();
    const M_now = moment().tz(JP);

    expect(D_now.format()).toEqual(M_now.format());
    expect(D_now.get('hour') - D_now.utc().get('hour')).toEqual(9);
  });
});

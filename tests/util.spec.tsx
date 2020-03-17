import moment from 'moment';
import momentGenerateConfig from '../src/generate/moment';
import { toArray } from '../src/utils/miscUtil';
import { isSameTime, isSameDecade, getWeekStartDate } from '../src/utils/dateUtil';
import { getMoment } from './util/commonUtil';

describe('Picker.Util', () => {
  it('toArray', () => {
    expect(toArray(null)).toEqual([]);
    expect(toArray(undefined)).toEqual([]);
    expect(toArray([1])).toEqual([1]);
    expect(toArray(1)).toEqual([1]);
  });

  // Time is only for time
  it('isSameTime', () => {
    expect(
      isSameTime(momentGenerateConfig, getMoment('2000-01-01'), getMoment('1989-11-28')),
    ).toBeTruthy();

    expect(isSameTime(momentGenerateConfig, null, getMoment('1989-11-28'))).toBeFalsy();

    expect(isSameTime(momentGenerateConfig, null, null)).toBeTruthy();
  });

  it('isSameDecade', () => {
    expect(isSameDecade(momentGenerateConfig, null, null)).toBeTruthy();
    expect(isSameDecade(momentGenerateConfig, getMoment('2000-01-02'), null)).toBeFalsy();
    expect(
      isSameDecade(momentGenerateConfig, getMoment('1995-01-01'), getMoment('1999-01-01')),
    ).toBeTruthy();
  });

  it('getWeekStartDate: en', () => {
    expect(
      getWeekStartDate('en', momentGenerateConfig, getMoment('2020-03-17').locale('en')).format(
        'YYYY-MM-DD',
      ),
    ).toBe('2020-03-01');
  });

  it('getWeekStartDate: zh-cn', () => {
    expect(
      getWeekStartDate(
        'zh-cn',
        momentGenerateConfig,
        getMoment('2020-03-17').locale('zh-cn'),
      ).format('YYYY-MM-DD'),
    ).toBe('2020-02-24');
  });

  describe('week starts from monday', () => {
    const defaultWeekStartDate = moment.localeData().firstDayOfWeek();
    const locale = moment.locale();

    beforeAll(() => {
      moment.updateLocale(locale, { week: { dow: 1 } });
    });
    afterAll(() => {
      moment.updateLocale(locale, { week: { dow: defaultWeekStartDate } });
    });

    it('getWeekStartDate', () => {
      expect(
        getWeekStartDate(locale, momentGenerateConfig, getMoment('2020-03-17')).format(
          'YYYY-MM-DD',
        ),
      ).toBe('2020-02-24');
    });
  });
});

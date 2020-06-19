import momentGenerateConfig from '../src/generate/moment';
import { getLowerBoundTime, setTime } from '../src/utils/timeUtil';
import { toArray } from '../src/utils/miscUtil';
import { isSameTime, isSameDecade } from '../src/utils/dateUtil';
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

  describe('getLowerBoundTime', () => {
    it('basic case', () => {
      expect(
        getLowerBoundTime(
          {
            hour: 23,
            minute: 59,
            second: 59,
          },
          {
            hourStep: 1,
            minuteStep: 1,
            secondStep: 1,
          },
        ),
      ).toEqual({
        hour: 23,
        minute: 59,
        second: 59,
      });
    });
    it('case to lower hour #1', () => {
      expect(
        getLowerBoundTime(
          {
            hour: 1,
            minute: 4,
            second: 5,
          },
          {
            hourStep: 4,
            minuteStep: 15,
            secondStep: 15,
          },
        ),
      ).toEqual({
        hour: 0,
        minute: 45,
        second: 45,
      });
    });
    it('case to lower hour #2', () => {
      expect(
        getLowerBoundTime(
          {
            hour: 3,
            minute: 4,
            second: 5,
          },
          {
            hourStep: 4,
            minuteStep: 15,
            secondStep: 15,
          },
        ),
      ).toEqual({
        hour: 0,
        minute: 45,
        second: 45,
      });
    });
    it('case to same hour, lower minute #1', () => {
      expect(
        getLowerBoundTime(
          {
            hour: 1,
            minute: 31,
            second: 5,
          },
          {
            hourStep: 1,
            minuteStep: 15,
            secondStep: 15,
          },
        ),
      ).toEqual({
        hour: 1,
        minute: 30,
        second: 45,
      });
    });
    it('case to same hour, lower minute #2', () => {
      expect(
        getLowerBoundTime(
          {
            hour: 1,
            minute: 44,
            second: 5,
          },
          {
            hourStep: 1,
            minuteStep: 15,
            secondStep: 15,
          },
        ),
      ).toEqual({
        hour: 1,
        minute: 30,
        second: 45,
      });
    });
    it('case to same hour, same minute, lower second #1', () => {
      expect(
        getLowerBoundTime(
          {
            hour: 1,
            minute: 44,
            second: 5,
          },
          {
            hourStep: 1,
            minuteStep: 1,
            secondStep: 15,
          },
        ),
      ).toEqual({
        hour: 1,
        minute: 44,
        second: 0,
      });
    });
    it('case to same hour, same minute, lower second #2', () => {
      expect(
        getLowerBoundTime(
          {
            hour: 1,
            minute: 44,
            second: 14,
          },
          {
            hourStep: 1,
            minuteStep: 1,
            secondStep: 15,
          },
        ),
      ).toEqual({
        hour: 1,
        minute: 44,
        second: 0,
      });
    });
  });

  describe('setTime', () => {
    expect(
      isSameTime(
        momentGenerateConfig,
        setTime(momentGenerateConfig, getMoment('1995-01-01 00:00:00'), 8, 7, 6),
        getMoment('1995-01-01 08:07:06'),
      ),
    ).toBeTruthy();
  });
});

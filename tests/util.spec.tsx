import momentGenerateConfig from '../src/generate/moment';
import { getClosestTime } from '../src/utils/timeUtil';
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

  describe('getClosestTime', () => {
    it('basic case', () => {
      expect(
        getClosestTime(
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
        getClosestTime(
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
    it('case to upper hour #1', () => {
      expect(
        getClosestTime(
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
        hour: 4,
        minute: 0,
        second: 0,
      });
    });
    it('case to lower minute #2', () => {
      expect(
        getClosestTime(
          {
            hour: 2,
            minute: 3,
            second: 0,
          },
          {
            hourStep: 1,
            minuteStep: 15,
            secondStep: 15,
          },
        ),
      ).toEqual({
        hour: 2,
        minute: 0,
        second: 45,
      });
    });
    it('case to upper minute #2', () => {
      expect(
        getClosestTime(
          {
            hour: 2,
            minute: 12,
            second: 0,
          },
          {
            hourStep: 1,
            minuteStep: 15,
            secondStep: 15,
          },
        ),
      ).toEqual({
        hour: 2,
        minute: 15,
        second: 0,
      });
    });
    it('case carry minute #1', () => {
      expect(
        getClosestTime(
          {
            hour: 21,
            minute: 55,
            second: 59,
          },
          {
            hourStep: 1,
            minuteStep: 1,
            secondStep: 15,
          },
        ),
      ).toEqual({
        hour: 21,
        minute: 56,
        second: 0,
      });
    });
    it('case carry hour #1', () => {
      expect(
        getClosestTime(
          {
            hour: 21,
            minute: 55,
            second: 59,
          },
          {
            hourStep: 1,
            minuteStep: 10,
            secondStep: 10,
          },
        ),
      ).toEqual({
        hour: 22,
        minute: 0,
        second: 0,
      });
    });
    it('case carry hour #3', () => {
      expect(
        getClosestTime(
          {
            hour: 21,
            minute: 59,
            second: 59,
          },
          {
            hourStep: 1,
            minuteStep: 1,
            secondStep: 15,
          },
        ),
      ).toEqual({
        hour: 22,
        minute: 0,
        second: 0,
      });
    });
    it('case carry day #1', () => {
      expect(
        getClosestTime(
          {
            hour: 22,
            minute: 30,
            second: 59,
          },
          {
            hourStep: 4,
            minuteStep: 1,
            secondStep: 15,
          },
        ),
      ).toEqual({
        hour: 0,
        minute: 0,
        second: 0,
      });
    });
    it('case carry day #2', () => {
      expect(
        getClosestTime(
          {
            hour: 23,
            minute: 50,
            second: 59,
          },
          {
            hourStep: 4,
            minuteStep: 30,
            secondStep: 15,
          },
        ),
      ).toEqual({
        hour: 0,
        minute: 0,
        second: 0,
      });
    });
    it('case carry day #3', () => {
      expect(
        getClosestTime(
          {
            hour: 23,
            minute: 59,
            second: 59,
          },
          {
            hourStep: 1,
            minuteStep: 1,
            secondStep: 15,
          },
        ),
      ).toEqual({
        hour: 0,
        minute: 0,
        second: 0,
      });
    });
    it('case random #1', () => {
      expect(
        getClosestTime(
          {
            hour: 20,
            minute: 45,
            second: 59,
          },
          {
            hourStep: 4,
            minuteStep: 15,
            secondStep: 15,
          },
        ),
      ).toEqual({
        hour: 20,
        minute: 45,
        second: 45,
      });
    });
    it('case random #2', () => {
      expect(
        getClosestTime(
          {
            hour: 20,
            minute: 59,
            second: 59,
          },
          {
            hourStep: 4,
            minuteStep: 15,
            secondStep: 15,
          },
        ),
      ).toEqual({
        hour: 20,
        minute: 45,
        second: 45,
      });
    });
    it('case random #3', () => {
      expect(
        getClosestTime(
          {
            hour: 20,
            minute: 59,
            second: 59,
          },
          {
            hourStep: 1,
            minuteStep: 15,
            secondStep: 15,
          },
        ),
      ).toEqual({
        hour: 21,
        minute: 0,
        second: 0,
      });
    });
    it('case random #4', () => {
      expect(
        getClosestTime(
          {
            hour: 20,
            minute: 30,
            second: 59,
          },
          {
            hourStep: 1,
            minuteStep: 1,
            secondStep: 15,
          },
        ),
      ).toEqual({
        hour: 20,
        minute: 31,
        second: 0,
      });
    });
    it('case random #5', () => {
      expect(
        getClosestTime(
          {
            hour: 0,
            minute: 9,
            second: 0,
          },
          {
            hourStep: 1,
            minuteStep: 10,
            secondStep: 1,
          },
        ),
      ).toEqual({
        hour: 0,
        minute: 10,
        second: 0,
      });
    });
  });
});

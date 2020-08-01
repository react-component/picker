import momentGenerateConfig from '../src/generate/moment';
import { getLowerBoundTime, setTime, getBoundTime } from '../src/utils/timeUtil';
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
      expect(getLowerBoundTime(23, 59, 59, 1, 1, 1)).toEqual([23, 59, 59]);
    });
    it('case to lower hour #1', () => {
      expect(getLowerBoundTime(1, 4, 5, 4, 15, 15)).toEqual([0, 45, 45]);
    });
    it('case to lower hour #2', () => {
      expect(getLowerBoundTime(3, 4, 5, 4, 15, 15)).toEqual([0, 45, 45]);
    });
    it('case to same hour, lower minute #1', () => {
      expect(getLowerBoundTime(1, 31, 5, 1, 15, 15)).toEqual([1, 30, 45]);
    });
    it('case to same hour, lower minute #2', () => {
      expect(getLowerBoundTime(1, 44, 5, 1, 15, 15)).toEqual([1, 30, 45]);
    });
    it('case to same hour, same minute, lower second #1', () => {
      expect(getLowerBoundTime(1, 44, 5, 1, 1, 15)).toEqual([1, 44, 0]);
    });
    it('case to same hour, same minute, lower second #2', () => {
      expect(getLowerBoundTime(1, 44, 14, 1, 1, 15)).toEqual([1, 44, 0]);
    });
  });

  describe('getBoundTime', () => {
    it('basic case', () => {
      expect(getBoundTime(23, 59, 59, 1, 1, 1)).toEqual([23, 59, 59]);
    });
    it('case to hour', () => {
      expect(getBoundTime(1, 4, 5, 4, 15, 15)).toEqual([0, 45, 45]);
      expect(getBoundTime(3, 4, 5, 4, 15, 15)).toEqual([4, 0, 0]);
      expect(getBoundTime(3, 4, 5, 4, 15, 15, () => [4])).toEqual([0, 45, 45]);
    });
    it('case to minute', () => {
      expect(getBoundTime(1, 31, 5, 1, 15, 15)).toEqual([1, 30, 45]);
      expect(getBoundTime(1, 44, 5, 1, 15, 15)).toEqual([1, 45, 0]);
      expect(getBoundTime(1, 44, 5, 1, 15, 15, () => [4], () => [45])).toEqual([1, 30, 45]);
    });
    it('case to second', () => {
      expect(getBoundTime(1, 44, 5, 1, 1, 15)).toEqual([1, 44, 0]);
      expect(getBoundTime(1, 44, 14, 1, 1, 15)).toEqual([1, 44, 15]);
      expect(getBoundTime(1, 44, 14, 1, 1, 15, () => [4], () => [45], () => [15])).toEqual([
        1,
        44,
        0,
      ]);
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

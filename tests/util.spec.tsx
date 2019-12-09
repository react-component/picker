import momentGenerateConfig from '../src/generate/moment';
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
      isSameTime(
        momentGenerateConfig,
        getMoment('2000-01-01'),
        getMoment('1989-11-28'),
      ),
    ).toBeTruthy();

    expect(
      isSameTime(momentGenerateConfig, null, getMoment('1989-11-28')),
    ).toBeFalsy();

    expect(isSameTime(momentGenerateConfig, null, null)).toBeTruthy();
  });

  it('isSameDecade', () => {
    expect(isSameDecade(momentGenerateConfig, null, null)).toBeTruthy();
    expect(
      isSameDecade(momentGenerateConfig, getMoment('2000-01-02'), null),
    ).toBeFalsy();
    expect(
      isSameDecade(
        momentGenerateConfig,
        getMoment('1995-01-01'),
        getMoment('1999-01-01'),
      ),
    ).toBeTruthy();
  });
});

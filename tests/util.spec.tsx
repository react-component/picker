// Note: zombieJ refactoring

import dayjs from 'dayjs';
import dayGenerate from '../src/generate/dayjs';
import { isInRange } from '../src/utils/dateUtil';

global.error = console.error;

describe('Picker.Util', () => {
  describe('isInRange', () => {
    it('not break with null', () => {
      expect(isInRange(dayGenerate, null, null, dayjs())).toBeFalsy();
    });
  });
});

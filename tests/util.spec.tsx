// Note: zombieJ refactoring

import dayjs from 'dayjs';
import dayGenerate from '../src/generate/dayjs';
import { isInRange } from '../src/utils/dateUtil';
import getDefaultExport from '../src/utils/getDefaultExport';

global.error = console.error;

describe('Picker.Util', () => {
  describe('getDefaultExport', () => {
    it('unwraps a transpiled CommonJS namespace loaded by Node ESM', () => {
      const component = () => null;
      const namespace = { default: component };
      Object.defineProperty(namespace, '__esModule', { value: true });
      expect(getDefaultExport(namespace)).toBe(component);
    });

    it.each([
      null,
      undefined,
      () => null,
      { $$typeof: Symbol.for('react.forward_ref'), render: () => null },
      { default: 'ordinary property' },
      { __esModule: false, default: 'ordinary property' },
      { __esModule: true },
    ])('preserves an already usable export: %p', (value) => {
      expect(getDefaultExport(value)).toBe(value);
    });
  });

  describe('isInRange', () => {
    it('not break with null', () => {
      expect(isInRange(dayGenerate, null, null, dayjs())).toBeFalsy();
    });
  });
});

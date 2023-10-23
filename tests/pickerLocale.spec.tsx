import * as path from 'path';
import * as fs from 'fs';
import * as React from 'react';
import { MomentPicker } from './util/commonUtil';
import { render } from '@testing-library/react';
import moment from 'moment';

const localePath = path.resolve(__dirname, '../src/locale');

const localeList = fs.readdirSync(localePath).map((file) => {
  return path.basename(file, '.ts');
});

localeList.forEach((localeName) => {
  let Picker: typeof MomentPicker;
  beforeAll(async () => {
    const locale = require(`../src/locale/${localeName}`).default;
    Picker = class extends MomentPicker {
      static defaultProps = { locale };
      render() {
        return super.render();
      }
    };
  });

  describe(`Locale: ${localeName}`, () => {
    function matchPicker(name: string, props?: any) {
      it(`format by locale with type ${name}`, () => {
        const date = moment('2000-01-01', 'YYYY-MM-DD');
        const { getByRole } = render(<Picker value={date} {...props} />);
        const input = getByRole('textbox');
        expect(input).toBeTruthy();
        expect(input).toMatchSnapshot();
      });
    }

    matchPicker('date');
    matchPicker('dateTime', { showTime: true });
    matchPicker('week', { picker: 'week' });
    matchPicker('month', { picker: 'month' });
    matchPicker('quarter', { picker: 'quarter' });
    matchPicker('year', { picker: 'year' });
  });
});

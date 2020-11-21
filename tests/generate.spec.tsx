import MockDate from 'mockdate';
import momentGenerateConfig from '../src/generate/moment';
import dayjsGenerateConfig from '../src/generate/dayjs';
import dateFnsGenerateConfig from '../src/generate/dateFns';
import { getMoment } from './util/commonUtil';

import 'dayjs/locale/zh-cn';
import { GenerateConfig } from '../src/generate';

describe('Picker.Generate', () => {
  beforeAll(() => {
    MockDate.set(getMoment('1990-09-03 01:02:03').toDate());
  });

  afterAll(() => {
    MockDate.reset();
  });

  const list: { name: string; generateConfig: GenerateConfig<any> }[] = [
    { name: 'moment', generateConfig: momentGenerateConfig },
    { name: 'dayjs', generateConfig: dayjsGenerateConfig },
    { name: 'date-fns', generateConfig: dateFnsGenerateConfig },
  ];

  list.forEach(({ name, generateConfig }) => {
    describe(name, () => {
      it('get', () => {
        const now = generateConfig.getNow();
        const fixedDate = generateConfig.getFixedDate('1990-09-03');
        const endDate = generateConfig.getEndDate(fixedDate);
        expect(generateConfig.getWeekDay(now)).toEqual(1);
        expect(generateConfig.getSecond(now)).toEqual(3);
        expect(generateConfig.getMinute(now)).toEqual(2);
        expect(generateConfig.getHour(now)).toEqual(1);
        expect(generateConfig.getDate(now)).toEqual(3);
        expect(generateConfig.getDate(fixedDate)).toEqual(3);
        expect(generateConfig.getDate(endDate)).toEqual(30);
        expect(generateConfig.getMonth(now)).toEqual(8);
        expect(generateConfig.getMonth(fixedDate)).toEqual(8);
        expect(generateConfig.getMonth(endDate)).toEqual(8);
        expect(generateConfig.getYear(now)).toEqual(1990);
        expect(generateConfig.getYear(fixedDate)).toEqual(1990);
        expect(generateConfig.getYear(endDate)).toEqual(1990);
      });

      it('set', () => {
        let date = generateConfig.getNow();
        date = generateConfig.setYear(date, 2020);
        date = generateConfig.setMonth(date, 9);
        date = generateConfig.setDate(date, 23);
        date = generateConfig.setHour(date, 2);
        date = generateConfig.setMinute(date, 3);
        date = generateConfig.setSecond(date, 5);

        expect(generateConfig.locale.format('en_US', date, 'YYYY-MM-DD HH:mm:ss')).toEqual(
          '2020-10-23 02:03:05',
        );
      });

      it('add', () => {
        let date = generateConfig.getNow();
        date = generateConfig.addYear(date, 2);
        date = generateConfig.addMonth(date, 2);
        date = generateConfig.addDate(date, 2);
        expect(generateConfig.locale.format('en_US', date, 'YYYY-MM-DD')).toEqual('1992-11-05');
      });

      it('isAfter', () => {
        const now = generateConfig.getNow();
        const prev = generateConfig.addDate(now, -1);
        const next = generateConfig.addDate(now, 1);
        expect(generateConfig.isAfter(now, prev)).toBeTruthy();
        expect(generateConfig.isAfter(next, now)).toBeTruthy();
      });

      it('isValidate', () => {
        expect(generateConfig.isValidate(generateConfig.getNow())).toBeTruthy();
      });

      describe('locale', () => {
        describe('parse', () => {
          it('basic', () => {
            ['2000-01-02', '02/01/2000'].forEach(str => {
              const date = generateConfig.locale.parse('en_US', str, ['YYYY-MM-DD', 'DD/MM/YYYY']);

              expect(generateConfig.locale.format('en_US', date!, 'YYYY-MM-DD')).toEqual(
                '2000-01-02',
              );
            });
          });

          it('week', () => {
            if (name !== 'date-fns') {
              expect(
                generateConfig.locale.format(
                  'en_US',
                  generateConfig.locale.parse('en_US', '2019-1st', ['gggg-wo'])!,
                  'gggg-wo',
                ),
              ).toEqual('2019-1st');
              expect(
                generateConfig.locale.format(
                  'zh_CN',
                  generateConfig.locale.parse('zh_CN', '2019-45周', ['gggg-wo'])!,
                  'gggg-wo',
                ),
              ).toEqual('2019-45周');
            } else {
              expect(
                generateConfig.locale.format(
                  'en_US',
                  generateConfig.locale.parse('en_US', '2019-1st', ['GGGG-wo'])!,
                  'GGGG-wo',
                ),
              ).toEqual(null);
            }
          });
        });
      });

      it('getWeekFirstDay', () => {
        expect(generateConfig.locale.getWeekFirstDay('en_US')).toEqual(0);
        expect(generateConfig.locale.getWeekFirstDay('zh_CN')).toEqual(1);

        // Should keep same weekday
        ['en_US', 'zh_CN'].forEach(() => {
          expect(
            generateConfig.getWeekDay(
              generateConfig.locale.parse('en_US', '2000-01-01', ['YYYY-MM-DD'])!,
            ),
          ).toEqual(6);
        });
      });

      it('getWeekFirstDayValue', () => {
        const formatStr = name === 'date-fns' ? 'yyyy-MM-dd' : 'YYYY-MM-DD';
        expect(
          generateConfig.locale.getWeekFirstDayValue(
            'en_US',
            generateConfig.locale.parse('en_US', '2020-12-30', [formatStr]),
          ),
        ).toEqual(1609027200000);
        expect(
          generateConfig.locale.getWeekFirstDayValue(
            'zh_CN',
            generateConfig.locale.parse('zh_CN', '2020-12-30', [formatStr]),
          ),
        ).toEqual(1609084800000);
      });

      it('Parse format Wo', () => {
        if (name !== 'date-fns') {
          expect(
            generateConfig.locale.parse('en_US', '2012-51st', ['YYYY-Wo']).format('Wo'),
          ).toEqual('51st');
          expect(
            generateConfig.locale.parse('zh_CN', '2012-1周', ['YYYY-Wo']).format('Wo'),
          ).toEqual('1周');
        }
      });

      it('Parse format faild', () => {
        expect(generateConfig.locale.parse('en_US', 'invalid string', ['invalid string'])).toEqual(
          null,
        );
        expect(
          generateConfig.locale.parse('en_US', 'invalid string', ['invalid string-Wo']),
        ).toEqual(null);
      });

      it('getShortWeekDays', () => {
        expect(generateConfig.locale.getShortWeekDays!('zh_CN')).toEqual([
          '日',
          '一',
          '二',
          '三',
          '四',
          '五',
          '六',
        ]);
        expect(generateConfig.locale.getShortWeekDays!('en_US')).toEqual([
          'Su',
          'Mo',
          'Tu',
          'We',
          'Th',
          'Fr',
          'Sa',
        ]);
      });

      it('getShortMonths', () => {
        expect(generateConfig.locale.getShortMonths!('zh_CN')).toEqual([
          '1月',
          '2月',
          '3月',
          '4月',
          '5月',
          '6月',
          '7月',
          '8月',
          '9月',
          '10月',
          '11月',
          '12月',
        ]);
        expect(generateConfig.locale.getShortMonths!('en_US')).toEqual([
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ]);
      });

      it('getWeek', () => {
        const formatStr = name === 'date-fns' ? 'yyyy-MM-dd' : 'YYYY-MM-DD';
        expect(
          generateConfig.locale.getWeek(
            'zh_CN',
            generateConfig.locale.parse('zh_CN', '2019-12-08', [formatStr]),
          ),
        ).toEqual(49);
        expect(
          generateConfig.locale.getWeek(
            'en_US',
            generateConfig.locale.parse('en_US', '2019-12-08', [formatStr]),
          ),
        ).toEqual(50);
      });
    });
  });
});

describe('Generate:moment', () => {
  it('getWeekDay', () => {
    const now = momentGenerateConfig.getNow();
    now.locale('zh-cn');
    expect(now.locale()).toEqual('zh-cn');

    momentGenerateConfig.getWeekDay(now);
    expect(now.locale()).toEqual('zh-cn');
  });
});

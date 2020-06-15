import MockDate from 'mockdate';
import momentGenerateConfig from '../src/generate/moment';
import dayjsGenerateConfig from '../src/generate/dayjs';
import dateFnsGenerateConfig from '../src/generate/date-fns';
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
        expect(generateConfig.getWeekDay(now)).toEqual(1);
        expect(generateConfig.getSecond(now)).toEqual(3);
        expect(generateConfig.getMinute(now)).toEqual(2);
        expect(generateConfig.getHour(now)).toEqual(1);
        expect(generateConfig.getDate(now)).toEqual(3);
        expect(generateConfig.getMonth(now)).toEqual(8);
        expect(generateConfig.getYear(now)).toEqual(1990);
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

              expect(generateConfig.locale.format('en_US', date!, 'YYYY-MM-Do')).toEqual(
                '2000-01-2nd',
              );
              expect(generateConfig.locale.format('zh_CN', date!, 'YYYY-MM-Do')).toEqual(
                '2000-01-2日',
              );
            });
          });

          it('week', () => {
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
          });
        });
      });

      describe('locale', () => {
        it('parse', () => {
          ['2000-01-02', '02/01/2000'].forEach(str => {
            const date = generateConfig.locale.parse('en_US', str, ['YYYY-MM-DD', 'DD/MM/YYYY']);

            expect(generateConfig.locale.format('en_US', date!, 'YYYY-MM-DD')).toEqual(
              '2000-01-02',
            );
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

      it('Parse format Wo', () => {
        let basic = generateConfig.locale.parse('en_US', '2012-51st', ['YYYY-Wo']);
        expect(generateConfig.locale.format('en_US', basic, 'Wo')).toEqual('51st');
        basic = generateConfig.locale.parse('zh_CN', '2012-1周', ['YYYY-Wo']);
        expect(generateConfig.locale.format('zh_CN', basic, 'Wo')).toEqual('1周');
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
        expect(
          generateConfig.locale.getWeek(
            'zh_CN',
            generateConfig.locale.parse('zh_CN', '2019-12-08', ['YYYY-MM-DD'])!,
          ),
        ).toEqual(49);
      });

      it('getWeek', () => {
        expect(
          generateConfig.locale.getWeek(
            'zh_CN',
            generateConfig.locale.parse('zh_CN', '2019-12-08', ['YYYY-MM-DD'])!,
          ),
        ).toEqual(49);
        expect(
          generateConfig.locale.getWeek(
            'en_US',
            generateConfig.locale.parse('en_US', '2019-12-08', ['YYYY-MM-DD'])!,
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

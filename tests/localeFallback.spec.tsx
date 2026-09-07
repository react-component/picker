import { cleanup, fireEvent, render } from '@testing-library/react';
import dayjs from 'dayjs';
import zhCNDayjsLocale from 'dayjs/locale/zh-cn';
import 'dayjs/locale/fr';
import updateLocale from 'dayjs/plugin/updateLocale';
import React from 'react';
import Picker, { PickerPanel } from '../src';
import dateFnsGenerateConfig from '../src/generate/dateFns';
import dayjsGenerateConfig from '../src/generate/dayjs';
import type { Locale } from '../src/interface';
import enUS from '../src/locale/en_US';
import plPL from '../src/locale/pl_PL';
import zhCN from '../src/locale/zh_CN';

dayjs.extend(updateLocale);

const shortMonths = Array.from({ length: 12 }, (_, index) => `month-${index + 1}`);
const shortWeekDays = Array.from({ length: 7 }, (_, index) => `day-${index}`);

function getTexts(selector: string) {
  return Array.from(document.querySelectorAll(selector), (element) => element.textContent);
}

function renderPanel(locale: Locale) {
  return render(
    <PickerPanel
      generateConfig={dayjsGenerateConfig}
      locale={locale}
      defaultValue={dayjs('2026-08-24')}
    />,
  );
}

describe('calendar locale fallback', () => {
  // Simulate an application that has not imported the requested Day.js locale.
  const registeredLocales = (dayjs as any).Ls;
  let originalLocales: typeof registeredLocales;
  let originalLocale: string;

  beforeEach(() => {
    originalLocale = dayjs.locale();
    originalLocales = { ...registeredLocales };
    dayjs.locale('en');
    delete registeredLocales['zh-cn'];
    delete registeredLocales.pl;
  });

  afterEach(() => {
    cleanup();
    Object.assign(registeredLocales, originalLocales);
    dayjs.locale(originalLocale);
  });

  it('localizes the popup and month selection without loading the Day.js locale', () => {
    render(
      <Picker
        open
        showNow
        generateConfig={dayjsGenerateConfig}
        locale={zhCN}
        defaultValue={dayjs('2026-08-24')}
      />,
    );

    expect(document.querySelector('.rc-picker-year-btn').textContent).toBe('2026年');
    expect(document.querySelector('.rc-picker-now-btn').textContent).toBe('今天');
    expect(document.querySelector('.rc-picker-month-btn').textContent).toBe('8月');
    expect(getTexts('thead th')).toEqual(['日', '一', '二', '三', '四', '五', '六']);

    fireEvent.click(document.querySelector('.rc-picker-month-btn'));
    expect(getTexts('.rc-picker-month-panel .rc-picker-cell-inner')).toEqual([
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
    expect(dayjs.locale()).toBe('en');
  });

  it.each([
    ['MMM', 'sie'],
    ['MMMM', 'sierpień'],
  ])('preserves %s month labels when the language is missing', (monthFormat, month) => {
    renderPanel({ ...plPL, monthFormat });

    expect(document.querySelector('.rc-picker-month-btn').textContent).toBe(month);
    fireEvent.click(document.querySelector('.rc-picker-month-btn'));
    expect(getTexts('.rc-picker-month-panel .rc-picker-cell-inner')[7]).toBe(month);
  });

  it('preserves explicit month and weekday labels', () => {
    renderPanel({ ...zhCN, shortMonths, shortWeekDays });

    expect(document.querySelector('.rc-picker-month-btn').textContent).toBe('month-8');
    expect(getTexts('thead th')).toEqual(shortWeekDays);
    fireEvent.click(document.querySelector('.rc-picker-month-btn'));
    expect(getTexts('.rc-picker-month-panel .rc-picker-cell-inner')).toEqual(shortMonths);
  });

  it('preserves loaded and customized Day.js locale data', () => {
    dayjs.locale({ ...zhCNDayjsLocale }, undefined, true);
    dayjs.updateLocale('zh-cn', { monthsShort: shortMonths, weekdaysMin: shortWeekDays });
    renderPanel(zhCN);

    expect(document.querySelector('.rc-picker-month-btn').textContent).toBe('month-8');
    expect(getTexts('thead th')).toEqual([...shortWeekDays.slice(1), shortWeekDays[0]]);
    fireEvent.click(document.querySelector('.rc-picker-month-btn'));
    expect(getTexts('.rc-picker-month-panel .rc-picker-cell-inner')).toEqual(shortMonths);
    expect(dayjs.locale()).toBe('en');
  });

  it('uses the requested language when another global language is loaded', () => {
    dayjs.locale('fr');
    renderPanel(zhCN);

    expect(document.querySelector('.rc-picker-month-btn').textContent).toBe('8月');
    expect(getTexts('thead th')).toEqual(['一', '二', '三', '四', '五', '六', '日']);
    expect(dayjs.locale()).toBe('fr');
  });

  it('preserves Day.js regional fallback to a loaded base language', () => {
    expect(dayjsGenerateConfig.locale.isLocaleAvailable('fr-XX')).toBe(true);
    expect(dayjs.locale()).toBe('en');

    renderPanel({
      ...enUS,
      locale: 'fr-XX',
      calendarFallback: { shortMonths, shortWeekDays },
    });

    expect(document.querySelector('.rc-picker-month-btn').textContent).toBe('août');
    expect(getTexts('thead th')).toEqual(['lu', 'ma', 'me', 'je', 've', 'sa', 'di']);
  });

  it('preserves custom month formats', () => {
    renderPanel({ ...zhCN, monthFormat: 'YYYY 年 M 月' });

    expect(document.querySelector('.rc-picker-month-btn').textContent).toBe('2026 年 8 月');
    fireEvent.click(document.querySelector('.rc-picker-month-btn'));
    expect(getTexts('.rc-picker-month-panel .rc-picker-cell-inner')[7]).toBe('2026 年 8 月');
  });

  it('keeps other date adapters responsible for their locale data', () => {
    render(
      <PickerPanel
        generateConfig={dateFnsGenerateConfig}
        locale={{
          ...enUS,
          calendarFallback: { shortMonths, shortWeekDays },
        }}
        defaultValue={new Date(2026, 7, 24)}
      />,
    );

    expect(document.querySelector('.rc-picker-month-btn').textContent).toBe('Aug');
    expect(getTexts('thead th')).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
    fireEvent.click(document.querySelector('.rc-picker-month-btn'));
    expect(getTexts('.rc-picker-month-panel .rc-picker-cell-inner')[7]).toBe('Aug');
  });

  it('keeps the default English labels', () => {
    renderPanel(enUS);

    expect(document.querySelector('.rc-picker-month-btn').textContent).toBe('Aug');
    expect(getTexts('thead th')).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
  });
});

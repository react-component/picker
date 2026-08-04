import { commonLocale } from './common';
import type { Locale } from '../interface';

const locale: Locale = {
  ...commonLocale,
  locale: 'tr_TR',
  today: 'Bugün',
  now: 'Şimdi',
  backToToday: 'Bugüne Geri Dön',
  ok: 'Tamam',
  clear: 'Temizle',
  week: 'Hafta',
  month: 'Ay',
  year: 'Yıl',
  hours: 'Saat',
  minutes: 'Dakika',
  seconds: 'Saniye',
  milliseconds: 'Milisaniye',
  timeSelect: 'Zaman Seç',
  dateSelect: 'Tarih Seç',
  monthSelect: 'Ay Seç',
  yearSelect: 'Yıl Seç',
  decadeSelect: 'On Yıl Seç',
  hourSelect: 'Bir saat seçin',
  minuteSelect: 'Bir dakika seçin',
  secondSelect: 'Bir saniye seçin',
  millisecondSelect: 'Bir milisaniye seçin',
  meridiemSelect: 'ÖÖ/ÖS seçin',

  previousMonth: 'Önceki Ay',
  nextMonth: 'Sonraki Ay',
  previousYear: 'Önceki Yıl',
  nextYear: 'Sonraki Yıl',
  previousDecade: 'Önceki On Yıl',
  nextDecade: 'Sonraki On Yıl',
  previousCentury: 'Önceki Yüzyıl',
  nextCentury: 'Sonraki Yüzyıl',
  shortWeekDays: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  shortMonths: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
};

export default locale;

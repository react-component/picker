import zhTW from '../src/locale/zh_TW';

describe('zh_TW locale', () => {
  it('uses the Taiwan week term consistently', () => {
    expect(zhTW.weekSelect).toBe('選擇週');
    expect(zhTW.weekSelect).toContain('週');
  });
});

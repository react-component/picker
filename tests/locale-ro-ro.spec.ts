import roRO from '../src/locale/ro_RO';

describe('ro_RO locale', () => {
  it('translates the time column labels', () => {
    expect(roRO.hourSelect).toBe('Selectează ora');
    expect(roRO.minuteSelect).toBe('Selectează minutul');
    expect(roRO.secondSelect).toBe('Selectează secunda');
    expect(roRO.millisecondSelect).toBe('Selectează milisecunda');
    expect(roRO.meridiemSelect).toBe('Selectează AM/PM');
  });

  it('uses the time of day wording for timeSelect', () => {
    expect(roRO.timeSelect).toBe('selectează ora');
  });
});

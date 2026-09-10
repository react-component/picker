import frBE from '../src/locale/fr_BE';

describe('Locale', () => {
  it('uses the French date prompt for fr_BE dateSelect', () => {
    expect(frBE.dateSelect).toBe('Sélectionner la date');
    expect(frBE.dateSelect).not.toBe(frBE.timeSelect);
  });
});

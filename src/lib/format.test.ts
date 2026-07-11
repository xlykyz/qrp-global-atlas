import { describe, expect, it } from 'vitest';
import { formatChange, formatMarketCap } from './format';

describe('market formatters', () => {
  it('formats market cap in billions', () => expect(formatMarketCap(128.4)).toBe('$128.4B'));
  it('keeps the sign visible for market feedback', () => {
    expect(formatChange(4.82)).toBe('+4.82%');
    expect(formatChange(-0.72)).toBe('-0.72%');
  });
});

import { describe, expect, it } from 'vitest';
import { mockDataset } from './mockData';
import { validateAtlasDataset } from './validateDataset';

describe('validateAtlasDataset', () => {
  it('accepts the complete mock scenario', () => expect(validateAtlasDataset(mockDataset)).toBe(mockDataset));

  it('rejects relationships that reference unknown companies', () => {
    const invalid = structuredClone(mockDataset);
    invalid.relationships[0].sourceCompanyId = 'missing-company';
    expect(() => validateAtlasDataset(invalid)).toThrow('未知公司');
  });

  it('rejects invalid geographic coordinates', () => {
    const invalid = structuredClone(mockDataset);
    invalid.events[0].coordinates.latitude = 120;
    expect(() => validateAtlasDataset(invalid)).toThrow('事件数据无效');
  });
});

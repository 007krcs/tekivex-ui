import { describe, it, expect } from 'vitest';
import { lgdSnapshot, lgdSnapshotMeta } from '../src/lgdSnapshot.js';
import type { AdminDivision } from '../src/types.js';

describe('lgdSnapshot()', () => {
  it('returns India as the only country', async () => {
    const loader = lgdSnapshot();
    const countries = await loader.countries();
    expect(countries).toEqual([{ code: 'IN', name: 'India' }]);
  });

  it('returns all 36 states + UTs by default', async () => {
    const loader = lgdSnapshot();
    const states = await loader.states('IN');
    expect(states.length).toBe(36);
    expect(states.find((s: AdminDivision) => s.code === 'IN-MH')?.name).toBe('Maharashtra');
    expect(states.find((s: AdminDivision) => s.code === 'IN-DL')?.name).toBe('Delhi');
    expect(states.find((s: AdminDivision) => s.code === 'IN-LA')?.name).toBe('Ladakh');
  });

  it('returns empty array for non-India country codes', async () => {
    const loader = lgdSnapshot();
    expect(await loader.states('US')).toEqual([]);
    expect(await loader.districts('US', 'US-CA')).toEqual([]);
    expect(await loader.subDistricts('US', 'US-CA', 'US-CA-LA')).toEqual([]);
  });

  it('filters states when onlyStates option is set', async () => {
    const loader = lgdSnapshot({ onlyStates: ['IN-MH', 'IN-KA'] });
    const states = await loader.states('IN');
    expect(states.map((s: AdminDivision) => s.code).sort()).toEqual(['IN-KA', 'IN-MH']);
  });

  it('refuses districts for filtered-out states', async () => {
    const loader = lgdSnapshot({ onlyStates: ['IN-MH'] });
    expect(await loader.districts('IN', 'IN-KA')).toEqual([]);
    const mhDistricts = await loader.districts('IN', 'IN-MH');
    expect(mhDistricts.length).toBeGreaterThan(0);
  });

  it('returns districts for an exemplar-covered state', async () => {
    const loader = lgdSnapshot();
    const districts = await loader.districts('IN', 'IN-MH');
    expect(districts.length).toBeGreaterThan(0);
    expect(districts.find((d: AdminDivision) => d.code === 'MH-PUN')?.name).toBe('Pune');
  });

  it('returns sub-districts for an exemplar-covered district', async () => {
    const loader = lgdSnapshot();
    const sd = await loader.subDistricts('IN', 'IN-MH', 'MH-PUN');
    expect(sd.length).toBeGreaterThan(0);
    expect(sd.find((x: AdminDivision) => x.code === 'PUN-HAV')?.name).toBe('Haveli');
  });

  it('returns empty array for a district not in the v0.1 exemplar set', async () => {
    const loader = lgdSnapshot();
    expect(await loader.subDistricts('IN', 'IN-MH', 'MH-NOT-IN-SET')).toEqual([]);
  });

  // ── Regional sub-district label ─────────────────────────────────────────────
  // The whole reason this package exists for many consumers.

  it('regional sub-district label: Taluka for MH/GJ/GA', () => {
    const loader = lgdSnapshot();
    expect(loader.subDistrictLabel!('IN', 'IN-MH')).toBe('Taluka');
    expect(loader.subDistrictLabel!('IN', 'IN-GJ')).toBe('Taluka');
    expect(loader.subDistrictLabel!('IN', 'IN-GA')).toBe('Taluka');
  });

  it('regional sub-district label: Taluk for KA/KL/TN', () => {
    const loader = lgdSnapshot();
    expect(loader.subDistrictLabel!('IN', 'IN-KA')).toBe('Taluk');
    expect(loader.subDistrictLabel!('IN', 'IN-KL')).toBe('Taluk');
    expect(loader.subDistrictLabel!('IN', 'IN-TN')).toBe('Taluk');
  });

  it('regional sub-district label: Mandal for AP/TG', () => {
    const loader = lgdSnapshot();
    expect(loader.subDistrictLabel!('IN', 'IN-AP')).toBe('Mandal');
    expect(loader.subDistrictLabel!('IN', 'IN-TG')).toBe('Mandal');
  });

  it('regional sub-district label: Tehsil for UP/BR/RJ/MP', () => {
    const loader = lgdSnapshot();
    expect(loader.subDistrictLabel!('IN', 'IN-UP')).toBe('Tehsil');
    expect(loader.subDistrictLabel!('IN', 'IN-BR')).toBe('Tehsil');
    expect(loader.subDistrictLabel!('IN', 'IN-RJ')).toBe('Tehsil');
    expect(loader.subDistrictLabel!('IN', 'IN-MP')).toBe('Tehsil');
  });

  it('regional sub-district label: Block for WB/JH/OD', () => {
    const loader = lgdSnapshot();
    expect(loader.subDistrictLabel!('IN', 'IN-WB')).toBe('Block');
    expect(loader.subDistrictLabel!('IN', 'IN-JH')).toBe('Block');
    expect(loader.subDistrictLabel!('IN', 'IN-OD')).toBe('Block');
  });

  it('regional sub-district label: fallback "Sub-district" for unknown state', () => {
    const loader = lgdSnapshot();
    expect(loader.subDistrictLabel!('IN', 'IN-ZZ')).toBe('Sub-district');
    expect(loader.subDistrictLabel!('US', 'US-CA')).toBe('Sub-district');
  });

  // ── Snapshot metadata ───────────────────────────────────────────────────────

  it('exposes snapshot metadata for consumer attribution', () => {
    expect(lgdSnapshotMeta.provider).toBe('Ministry of Panchayati Raj, Government of India');
    expect(lgdSnapshotMeta.license).toBe('GODL-India v1.0');
    expect(lgdSnapshotMeta.sourceUrl).toBe('https://lgdirectory.gov.in/');
    expect(lgdSnapshotMeta.snapshotDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

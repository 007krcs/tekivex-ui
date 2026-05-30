// ─────────────────────────────────────────────────────────────────────────────
// lgdSnapshot — a DivisionsLoader backed by the bundled LGD JSON snapshot.
//
// Why a function (lgdSnapshot()) and not a const (lgdSnapshot):
//   - Each call returns a *fresh* loader instance, so consumers who pass it
//     directly into <TkxAddressInput divisionsSource={lgdSnapshot()} /> get
//     stable referential identity across renders ONLY if they call it once
//     and memoize. Documenting that explicitly in the JSDoc.
//   - Future versions may accept options (locale, filter to specific states,
//     pin to a snapshot date). A function gives us that room without a
//     breaking API change.
//
// Data shape:
//   - All data is loaded synchronously from the bundled JSON files. The
//     loader methods are async only to match the DivisionsLoader contract
//     (which is async-first so REST and lazy-import implementations work).
//
// Bundle-size note:
//   - states.json (~2 KB), districts.json (~4 KB exemplar / ~25 KB full),
//     sub-districts.json (~3 KB exemplar / ~250 KB full). Bundle impact
//     is ~10 KB gzipped at v0.1.0-alpha.1, growing to ~70 KB gzipped at
//     v0.1.0 once full LGD coverage is ingested.
// ─────────────────────────────────────────────────────────────────────────────

import type { AdminDivision, DivisionsLoader } from './types';
import statesJson from './data/states.json' with { type: 'json' };
import districtsJson from './data/districts.json' with { type: 'json' };
import subDistrictsJson from './data/sub-districts.json' with { type: 'json' };
import metaJson from './data/_meta.json' with { type: 'json' };

// ── Typed view of the bundled JSON ───────────────────────────────────────────

interface StatesFile {
  countryCode: string;
  states: Array<AdminDivision & { kind: 'State' | 'UT' }>;
}
interface DistrictsFile {
  districtsByState: Record<string, AdminDivision[]>;
}
interface SubDistrictsFile {
  subDistrictsByDistrict: Record<string, AdminDivision[]>;
}
interface MetaFile {
  regionalSubDistrictTerms: {
    byState: Record<string, string>;
  };
  snapshotDate: string;
}

const STATES_FILE = statesJson as unknown as StatesFile;
const DISTRICTS_FILE = districtsJson as unknown as DistrictsFile;
const SUB_DISTRICTS_FILE = subDistrictsJson as unknown as SubDistrictsFile;
const META = metaJson as unknown as MetaFile;

const INDIA: AdminDivision = { code: 'IN', name: 'India' };

// ── Public API ───────────────────────────────────────────────────────────────

export interface LgdSnapshotOptions {
  /**
   * Filter to a specific subset of state codes (ISO 3166-2). Useful when
   * a product only operates in certain states (e.g. a Maharashtra-only
   * municipal app). Defaults to all 36 states/UTs.
   */
  onlyStates?: readonly string[];
}

/**
 * Build a DivisionsLoader backed by the bundled LGD snapshot. Pass to
 * `TkxAddressInput`'s `divisionsSource` prop.
 *
 * @example
 *   import { lgdSnapshot } from 'tekivex-india-admin';
 *   // Memoize at module level so identity is stable across renders:
 *   const divisions = lgdSnapshot();
 *
 *   function ShippingForm() {
 *     const [addr, setAddr] = useState({});
 *     return <TkxAddressInput value={addr} onChange={setAddr} divisionsSource={divisions} />;
 *   }
 *
 * @example  // Maharashtra-only product:
 *   const divisions = lgdSnapshot({ onlyStates: ['IN-MH'] });
 */
export function lgdSnapshot(options: LgdSnapshotOptions = {}): DivisionsLoader {
  const stateFilter = options.onlyStates ? new Set(options.onlyStates) : null;

  return {
    countries: async () => [INDIA],

    states: async (countryCode) => {
      if (countryCode !== 'IN') return [];
      const all = STATES_FILE.states.map(({ code, name, localName }) => ({
        code, name, ...(localName ? { localName } : {}),
      }));
      if (!stateFilter) return all;
      return all.filter((s) => stateFilter.has(s.code));
    },

    districts: async (countryCode, stateCode) => {
      if (countryCode !== 'IN') return [];
      if (stateFilter && !stateFilter.has(stateCode)) return [];
      return DISTRICTS_FILE.districtsByState[stateCode] ?? [];
    },

    subDistricts: async (countryCode, _stateCode, districtCode) => {
      if (countryCode !== 'IN') return [];
      return SUB_DISTRICTS_FILE.subDistrictsByDistrict[districtCode] ?? [];
    },

    subDistrictLabel: (countryCode, stateCode) => {
      if (countryCode !== 'IN') return 'Sub-district';
      return META.regionalSubDistrictTerms.byState[stateCode] ?? 'Sub-district';
    },
  };
}

/** Snapshot metadata (date, attribution). Useful for displaying "data
 *  current as of YYYY-MM-DD" in a settings/about page. */
export const lgdSnapshotMeta = {
  snapshotDate: META.snapshotDate,
  provider: 'Ministry of Panchayati Raj, Government of India',
  source: 'Local Government Directory (LGD)',
  sourceUrl: 'https://lgdirectory.gov.in/',
  license: 'GODL-India v1.0',
} as const;

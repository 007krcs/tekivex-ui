// ─────────────────────────────────────────────────────────────────────────────
// tekivex-india-admin — type contracts.
//
// These mirror tekivex-ui's DivisionsLoader / AdminDivision exactly so this
// package can be used WITHOUT installing tekivex-ui (Node server-side scripts,
// data pipelines, etc.). When used alongside tekivex-ui v3.20+, structural
// type compatibility means the loader passed to <TkxAddressInput
// divisionsSource={...} /> Just Works without an explicit cast.
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminDivision {
  /** Stable code: ISO 3166-1 alpha-2 (countries), ISO 3166-2 (states),
   *  LGD code or loader-defined identifier (districts / sub-districts). */
  code: string;
  /** Display name in English / Latin script. */
  name: string;
  /** Optional name in regional script (Devanagari, Tamil, Kannada, etc.). */
  localName?: string;
}

export type DivisionLevel = 'country' | 'state' | 'district' | 'subDistrict';

export interface DivisionsLoader {
  countries(signal?: AbortSignal): Promise<AdminDivision[]>;
  states(countryCode: string, signal?: AbortSignal): Promise<AdminDivision[]>;
  districts(
    countryCode: string,
    stateCode: string,
    signal?: AbortSignal,
  ): Promise<AdminDivision[]>;
  subDistricts(
    countryCode: string,
    stateCode: string,
    districtCode: string,
    signal?: AbortSignal,
  ): Promise<AdminDivision[]>;
  subDistrictLabel?(countryCode: string, stateCode: string): string;
}

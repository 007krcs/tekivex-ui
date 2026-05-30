# tekivex-india-admin

Pluggable `DivisionsLoader` for [`tekivex-ui`](https://www.npmjs.com/package/tekivex-ui)'s
`TkxAddressInput`, bundling a snapshot of the Government of India's
[Local Government Directory (LGD)](https://lgdirectory.gov.in/) — every
state / UT, every district, every sub-district — with **region-correct
labels** (Taluka / Tehsil / Mandal / Block / Circle / Sub-division) so
your forms speak the same admin language as the locality they're filed
in.

```sh
npm install tekivex-india-admin
```

## Status

> **v0.1.0-alpha.1** — API stable, exemplar dataset only. Full LGD snapshot
> in v0.1.0. See [coverage](#coverage) below.

## Quick start

```tsx
import { TkxAddressInput } from 'tekivex-ui';
import { lgdSnapshot } from 'tekivex-india-admin';

// Memoize at module level — identity stable across renders:
const divisions = lgdSnapshot();

function ShippingForm() {
  const [addr, setAddr] = useState({});
  return (
    <TkxAddressInput
      value={addr}
      onChange={setAddr}
      divisionsSource={divisions}
    />
  );
}
```

That's the whole integration. The component now renders a cascading row
of four dropdowns above the PIN field — Country → State / UT → District
→ (Taluka / Tehsil / Mandal / Block / …, picked per-state) — and writes
both display names and stable ISO 3166-2 / LGD codes into the value
object.

## What you get

```ts
import { lgdSnapshot, lgdSnapshotMeta, type DivisionsLoader } from 'tekivex-india-admin';
```

### `lgdSnapshot(options?): DivisionsLoader`

Build a loader backed by the bundled JSON snapshot. Options:

| Field | Type | Default | Description |
|---|---|---|---|
| `onlyStates` | `readonly string[]` | all 36 | ISO 3166-2 codes to restrict to. Useful when your product only operates in certain states. |

### `lgdSnapshotMeta`

```ts
{
  snapshotDate: '2026-05-30',
  provider: 'Ministry of Panchayati Raj, Government of India',
  source: 'Local Government Directory (LGD)',
  sourceUrl: 'https://lgdirectory.gov.in/',
  license: 'GODL-India v1.0',
}
```

Display the `snapshotDate` somewhere in your product's "About" / settings
page so users know how fresh the boundary data is.

### Regional sub-district labels

The right name for the sub-district level varies by state. The loader's
`subDistrictLabel(countryCode, stateCode)` returns the correct label per
LGD/state-government convention:

| States | Label |
|---|---|
| Maharashtra, Gujarat, Goa | Taluka |
| Karnataka, Kerala, Tamil Nadu | Taluk |
| Andhra Pradesh, Telangana | Mandal |
| West Bengal, Jharkhand, Odisha | Block |
| UP, Bihar, Rajasthan, MP, Haryana, Punjab, Uttarakhand, HP, J&K, Ladakh, Chhattisgarh | Tehsil |
| Assam, Arunachal Pradesh | Circle |
| Mizoram, Nagaland, Tripura | RD Block |
| Manipur, Sikkim | Sub-division |
| Meghalaya | C&RD Block |

`TkxAddressInput` calls `subDistrictLabel` automatically and re-renders the
4th dropdown's label whenever the selected state changes.

## Custom data sources

`DivisionsLoader` is just an interface. You can plug in any source:

- A REST endpoint backed by your own database
- A lazy-imported chunk of a larger dataset
- A subset of the LGD snapshot mixed with your own internal codes
- A non-India loader (Indonesia, Brazil, Pakistan, …)

Any object that satisfies the `DivisionsLoader` shape is a valid value
for `TkxAddressInput`'s `divisionsSource` prop.

## Coverage

`v0.1.0-alpha.1` ships:

- ✅ States / UTs — **complete** (all 36)
- ⚠️ Districts — **exemplar set only** (~50 districts across 10 major
  states: MH, KA, TN, DL, WB, AP, UP, GJ, KL, RJ). Sufficient to demo
  the cascade UI end-to-end. Other state codes will return an empty
  `districts()` array.
- ⚠️ Sub-districts — **exemplar set only** (one district per major
  state). Other district codes will return an empty `subDistricts()`
  array.

Full LGD coverage will be ingested for `v0.1.0` (non-alpha). The data
pipeline is being built; see
[tracking issue](https://github.com/007krcs/tekivex-ui/issues) tagged
`india-admin-data`.

## License & attribution

This package's **code** is MIT-style; the **data** is published under
the [Government Open Data License — India (GODL-India) v1.0](./LICENSES/GODL-India.txt).
The two are bundled together because the package's value IS the data.

### Attribution for downstream consumers

If you ship a product built on this package, paste this into your app's
NOTICES / About / Credits page:

> Indian administrative-division data sourced from the Local Government
> Directory (https://lgdirectory.gov.in/), Ministry of Panchayati Raj,
> Government of India, under the Government Open Data License — India
> (GODL-India v1.0). Snapshot dated 2026-05-30. Bundled via
> tekivex-india-admin.

See [NOTICE.md](./NOTICE.md) for the full attribution and exclusions.

## What this package is NOT

- **Not a legal source of truth.** Admin boundaries change (J&K 2019,
  district splits, UT reorganisations). Re-snapshot for legally
  significant decisions.
- **Not a GoI / state-government logo or emblem ship.** GODL-India
  excludes crests and symbols; this package strictly does too.
- **Not a village-level directory.** LGD has ~640,000 villages; bundling
  them into a React-app dependency is a non-goal. Use the LGD REST API
  or your own backend for that.
- **Not certified or endorsed by the Ministry of Panchayati Raj or any
  Indian government department.** This is an independent, GODL-compliant
  redistribution.

## Contributing

If you'd like to help complete the snapshot coverage, see the
[contributing guide](https://github.com/007krcs/tekivex-ui/blob/master/CONTRIBUTING.md)
and the `india-admin-data` tag on the
[issue tracker](https://github.com/007krcs/tekivex-ui/issues).

# NOTICE

`tekivex-india-admin` bundles a snapshot of administrative-division data
sourced from the **Local Government Directory (LGD)** maintained by the
**Ministry of Panchayati Raj, Government of India**, with technical hosting
by the **National Informatics Centre (NIC)**.

- **Source:** https://lgdirectory.gov.in/
- **Snapshot date:** see `src/data/_meta.json` → `snapshotDate`
- **License:** [Government Open Data License — India (GODL-India) v1.0](./LICENSES/GODL-India.txt)
- **Attribution clause:** the GODL-India license requires acknowledging the
  provider, source, and license. This file together with the in-package
  `_attribution` field on every data file satisfies that obligation. When
  redistributing or reusing this data in your own product, please preserve
  attribution — see the "Attribution for downstream consumers" section in
  the README.

This package is published independently of `tekivex-ui` so that data
updates (district splits, UT reorganisations, new sub-districts) do not
require a `tekivex-ui` version bump.

## What is NOT covered

Per § 7 of GODL-India, the license does not extend to:

- Personal information
- Non-shareable / sensitive data
- Names, crests, logos and official symbols of the data provider
- Data subject to other intellectual property rights
- Military insignia
- Identity documents
- Data that should not have been publicly disclosed under § 8 of the
  Right to Information Act, 2005

This package ships ONLY administrative-division names + stable codes. It
does NOT ship GoI / state government emblems, flags, crests, or logos.

## No warranty of accuracy

GODL-India does not warrant the accuracy of the underlying data, and
neither does this package. Indian administrative boundaries change.
Always re-snapshot from `lgdirectory.gov.in` before relying on this data
for legally significant decisions (statutory filings, tax jurisdiction,
electoral rolls, etc.).

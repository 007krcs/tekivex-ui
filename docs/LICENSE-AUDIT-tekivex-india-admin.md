# License audit — `tekivex-india-admin` v0.1

**Audit date:** 2026-05-30
**Auditor:** Claude (engineering — NOT legal counsel)
**Scope:** can `tekivex-india-admin` legally bundle and redistribute, as an
npm package, India administrative-division data (state / district /
sub-district codes + names) sourced from the Local Government Directory
(`lgdirectory.gov.in`) and Open Government Data Platform India
(`data.gov.in`)?

> ⚠️ **This is an engineering-level audit.** Before publishing
> `tekivex-india-admin@0.1.0` to npm, the findings here must be reviewed by
> a lawyer qualified in Indian IP law. The user-facing risk of getting this
> wrong is low (GODL-India is a permissive license and community
> redistribution precedents exist) but non-zero.

---

## Sources consulted

| Source | URL | Reachable from this audit? |
|---|---|---|
| GODL-India full text (India Post mirror) | https://www.indiapost.gov.in/documents/media/OGD.pdf | ✅ binary fetched (1.2 MB PDF, content not parseable from raw stream) |
| Wikipedia `Template:GODL-India` | https://en.wikipedia.org/wiki/Template:GODL-India | ✅ |
| data.gov.in LGD catalog | https://www.data.gov.in/catalog/local-government-directory-lgd | ❌ 403 from US fetcher (user must verify in browser) |
| GitHub community LGD mirror | https://github.com/planemad/india-local-government-directory | ✅ |
| LGD canonical site | https://lgdirectory.gov.in/ | ✅ partial — copyright tag visible, license tag not in rendered HTML |
| Wikidata Q99891295 (GODL-India) | https://www.wikidata.org/wiki/Q99891295 | indirect |

## License — GODL-India v1.0

### Rights granted (verbatim, per Wikipedia template + Gazette summary)

> "worldwide, royalty-free, non-exclusive license to use, adapt, publish
> (either in original, or in adapted and/or derivative forms), translate,
> display, add value, and create derivative works (including products and
> services), for all lawful commercial and non-commercial purposes."

This explicitly permits:

- ✅ Adaptation (re-encoding from CSV → JSON, normalising codes)
- ✅ Translation (we'd be staying in English)
- ✅ Publishing in derivative form (an npm package IS a derivative form)
- ✅ Commercial use (downstream consumers can sell products built on it)
- ✅ Creating derivative products and services (the package is exactly this)

### Attribution required

> "acknowledge the provider, source, and license of data by explicitly
> publishing the attribution statement, including the DOI (Digital Object
> Identifier), or the URL (Uniform Resource Locator), or the URI (Uniform
> Resource Identifier)."

Exact attribution string is implementer's choice. The implementation
strategy we'll adopt:

- `LICENSES/GODL-India.txt` — full license text bundled in the package
- `NOTICE.md` — names data provider, source URL, snapshot date, license
- Each generated `.json` data file carries a top-level `_attribution`
  field with provider + source + snapshot date
- README has a "Attribution" section consumers can copy-paste into their
  own product's NOTICES / about / credits page

### Explicitly NOT covered by GODL-India

The license does NOT extend to:

- Personal information
- Non-shareable / sensitive data
- **Names, crests, logos and official symbols of the data provider**
- Data subject to other intellectual property rights
- Military insignia
- Identity documents
- Data that should not have been publicly disclosed under § 8 of the RTI
  Act, 2005

**Our exposure analysis on each exclusion:**

| Exclusion | Applies to our package? | Mitigation |
|---|---|---|
| Personal information | ❌ no (admin division names ≠ personal data) | n/a |
| Non-shareable / sensitive | ❌ no (boundary names are public reference) | n/a |
| **Crests, logos, official symbols** | ⚠️ **must not ship** | Strictly data only — no SVG/raster of GoI / state emblems |
| Other IP | ❌ no (text + code IDs only) | n/a |
| Military insignia | ❌ no | n/a |
| Identity documents | ❌ no | n/a |
| RTI § 8 data | ❌ no (LGD data is published under RTI proactive disclosure) | n/a |

### Warranty disclaimer

GODL-India does not warrant data accuracy. Our package should mirror this
disclaimer in README + JSDoc — admin boundaries change (J&K 2019, new
district splits, UT reorganisations) and a snapshot can go stale.

## Source of the LGD data specifically

- **Publisher:** Ministry of Panchayati Raj, Government of India
- **Hosting / technical operator:** National Informatics Centre (NIC)
- **Canonical URL:** https://lgdirectory.gov.in/
- **Bulk download endpoint:** https://lgdirectory.gov.in/downloadDoc.do
- **Coverage at audit date:** 36 States/UTs, 784 Districts, 676,760 villages

The site's footer states: *"Contents on this website is owned, updated and
managed by the Panchayats and State Panchayati Raj Department."*

**Open question to resolve in browser** (couldn't fetch from US):
`data.gov.in/catalog/local-government-directory-lgd` should explicitly tag
the dataset's license. Standard data.gov.in catalog pages display this in
a "License: …" cell. The user should:

1. Open that URL in a normal browser
2. Locate the License tag
3. Screenshot or copy the exact license string
4. Paste into this file before publishing v0.1

If the catalog tag says anything OTHER than GODL-India (e.g. "Other
license" with bespoke terms), this audit is invalidated and needs to be
redone against that license.

## Redistribution precedent

The community repo `planemad/india-local-government-directory` has
redistributed LGD data on GitHub under GODL-India since at least 2022,
attributing to `lgdirectory.gov.in` as the source. It links to a more
current mirror at `ramseraph.github.io/opendata/lgd/`. Neither has, to
the auditor's knowledge, faced takedown requests or copyright complaints.

This is not legal advice but is reasonable evidence that the Indian
government's `lgdirectory.gov.in` data IS being redistributed
publicly without challenge.

## Recommended package practices

1. ✅ Bundle full GODL-India text at `LICENSES/GODL-India.txt`
2. ✅ Top-level `NOTICE.md` with provider / source / snapshot date / URL
3. ✅ README "Attribution" section consumers can copy
4. ✅ `_attribution` field embedded in every data JSON file
5. ✅ Package.json `license: "GODL-India"` (with a SPDX-license-identifier
   note that this is a non-SPDX-registered license — see below)
6. ❌ Do NOT bundle any GoI / state emblems, crests, logos, flags
7. ❌ Do NOT bundle village-level data in v0.1 (640k rows, no consumer
   demand, increased exposure surface)
8. ✅ README disclaimer: "Snapshot dated YYYY-MM-DD. Admin boundaries
   change. Re-snapshot from upstream when consumer-critical."

## SPDX identifier status

GODL-India does NOT currently have a registered SPDX identifier (verified
2026-05-30). For `package.json` `license:` field, options are:

1. `"SEE LICENSE IN LICENSES/GODL-India.txt"` — recommended, npm-compliant
2. Custom SPDX expression `"LicenseRef-GODL-India"` — npm-compliant too
3. We could submit GODL-India to SPDX for a future identifier
   (out of scope for v0.1)

## Open Definition status

GODL-India IS commonly considered conformant with the
[Open Definition](https://opendefinition.org/) — i.e. the data is "open
data" in the proper sense — but the Open Definition team has not
formally certified it on their conformant-licenses list as of audit date.

## Pending human actions before v0.1 publish

- [ ] Lawyer review of this audit
- [ ] User visits `https://www.data.gov.in/catalog/local-government-directory-lgd` in browser and confirms the dataset's tagged license is GODL-India
- [ ] User confirms with Ministry of Panchayati Raj or via [Contact LGD] that bulk redistribution is permitted (low risk — community precedent exists, but worth a paper trail)
- [ ] Resnapshot the LGD data at publish time so the bundled snapshot is fresh

---

## Conclusion (engineering view, not legal advice)

GODL-India v1.0 grants the rights `tekivex-india-admin` needs, with a
clean attribution requirement we can satisfy with the steps above.
Community precedent suggests low practical risk. Before publishing v0.1
to npm, the four pending human actions above must be checked off.

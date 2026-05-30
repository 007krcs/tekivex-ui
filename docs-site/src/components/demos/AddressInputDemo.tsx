import { useState, useMemo } from 'react';
import { TkxAddressInput, type AddressValue } from 'tekivex-ui';
import { lgdSnapshot } from 'tekivex-india-admin';
import { Preview } from '../Preview';

// ─────────────────────────────────────────────────────────────────────────────
// Live demos for /components/address-input/.
//
// Two complementary patterns:
//   1. AddressInputPINOnly — the default behaviour. Type a 6-digit PIN, the
//      India Post public API auto-fills city / state / country.
//   2. AddressInputCascade — opt into divisionsSource for explicit
//      Country → State → District → Sub-district dropdowns (with
//      region-correct labels via tekivex-india-admin). PIN lookup still
//      works alongside.
// ─────────────────────────────────────────────────────────────────────────────

export function AddressInputPINOnly() {
  const [addr, setAddr] = useState<Partial<AddressValue>>({});
  return (
    <Preview label="PIN-only mode (no extra deps)" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ width: '100%', maxWidth: 600 }}>
        <TkxAddressInput value={addr} onChange={setAddr} label="Try a real PIN: 411001 (Pune) or 400050 (Bandra, Mumbai)" />
        <pre style={{ marginTop: 12, fontSize: 11, opacity: 0.7, background: 'rgba(127,127,127,0.08)', padding: 8, borderRadius: 6, overflow: 'auto' }}>
{JSON.stringify(addr, null, 2)}
        </pre>
      </div>
    </Preview>
  );
}

// Module-level loader keeps referential identity stable across re-renders —
// without this, every render would trigger a fresh countries() fetch inside
// TkxAddressInput's useEffect.
const divisions = lgdSnapshot();

export function AddressInputCascade() {
  const [addr, setAddr] = useState<Partial<AddressValue>>({});
  // Stable reference. Equivalent to `divisions` above; shown explicitly here
  // to document the useMemo pattern for consumers who prefer it inline.
  const source = useMemo(() => divisions, []);
  return (
    <Preview label="Full cascade with tekivex-india-admin" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ width: '100%', maxWidth: 600 }}>
        <TkxAddressInput
          value={addr}
          onChange={setAddr}
          divisionsSource={source}
          label="Pick India → Maharashtra → Pune → Haveli — note the label says 'Taluka'. Switch to Andhra Pradesh and it becomes 'Mandal'."
        />
        <pre style={{ marginTop: 12, fontSize: 11, opacity: 0.7, background: 'rgba(127,127,127,0.08)', padding: 8, borderRadius: 6, overflow: 'auto' }}>
{JSON.stringify(addr, null, 2)}
        </pre>
      </div>
    </Preview>
  );
}

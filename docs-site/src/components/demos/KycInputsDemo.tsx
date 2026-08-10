import { useState } from 'react';
import {
  TkxPanInput,
  TkxVoterIdInput,
  TkxDrivingLicenceInput,
  type DrivingLicenceChangePayload,
} from 'tekivex-ui';
import { Preview } from '../Preview';

// ─────────────────────────────────────────────────────────────────────────────
// Live demos for /components/kyc-inputs/.
//
// Format validation runs entirely in the browser — nothing is submitted or
// sent anywhere, and no real KYC verification happens. Use the obviously
// fake sample values from the placeholders to see the valid/invalid states.
// ─────────────────────────────────────────────────────────────────────────────

export function KycPanVoter() {
  return (
    <Preview
      label="Demo only — values stay in your browser; no KYC check occurs"
      style={{ flexDirection: 'column', alignItems: 'stretch' }}
    >
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TkxPanInput label="PAN (try ABCPE1234F — fake sample)" />
        <TkxVoterIdInput label="Voter ID (try ABC1234567 — fake sample)" />
      </div>
    </Preview>
  );
}

export function KycDrivingLicence() {
  const [payload, setPayload] = useState<DrivingLicenceChangePayload | null>(null);
  return (
    <Preview
      label="Change payload — raw / normalised / pretty / valid (fake sample data)"
      style={{ flexDirection: 'column', alignItems: 'stretch' }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <TkxDrivingLicenceInput
          label="Driving licence (try MH-12-2010-0012345 — fake sample)"
          onChange={setPayload}
        />
        <pre
          style={{
            marginTop: 12,
            fontSize: 12,
            color: 'var(--sl-color-gray-2, #4b5563)',
            background: 'var(--sl-color-gray-6, rgba(127,127,127,0.08))',
            padding: 10,
            borderRadius: 6,
            overflow: 'auto',
            lineHeight: 1.5,
          }}
        >
{JSON.stringify(payload ?? { raw: '', normalised: '', pretty: '', valid: false }, null, 2)}
        </pre>
      </div>
    </Preview>
  );
}

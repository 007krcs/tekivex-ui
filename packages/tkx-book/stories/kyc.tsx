import { useState } from 'react';
import {
  TkxPanInput,
  TkxVoterIdInput,
  TkxDrivingLicenceInput,
} from 'tekivex-ui';
import type { Story } from '../src/types';

function KycStory(p: any) {
  const [pan, setPan] = useState({ valid: false, normalised: '' });
  const [voter, setVoter] = useState({ valid: false, normalised: '' });
  const [dl, setDl] = useState({ valid: false, normalised: '', pretty: '' });

  const Wrap = ({ children }: { children: React.ReactNode }) => (
    <div style={{ minWidth: 280, marginBottom: 12 }}>{children}</div>
  );

  return (
    <div style={{ minWidth: 320 }}>
      {p.show !== 'voter' && p.show !== 'dl' && (
        <Wrap>
          <TkxPanInput
            label="PAN"
            onChange={({ normalised, valid }) => setPan({ normalised, valid })}
          />
          <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            Try <code>ABCPK1234F</code> · valid: <strong>{String(pan.valid)}</strong>
          </p>
        </Wrap>
      )}

      {p.show !== 'pan' && p.show !== 'dl' && (
        <Wrap>
          <TkxVoterIdInput
            label="Voter ID"
            onChange={({ normalised, valid }) => setVoter({ normalised, valid })}
          />
          <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            Try <code>ABC1234567</code> · valid: <strong>{String(voter.valid)}</strong>
          </p>
        </Wrap>
      )}

      {p.show !== 'pan' && p.show !== 'voter' && (
        <Wrap>
          <TkxDrivingLicenceInput
            label="Driving Licence"
            onChange={({ normalised, pretty, valid }) =>
              setDl({ normalised, pretty, valid })
            }
          />
          <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            Try <code>MH-12-2010-0012345</code> · pretty:{' '}
            <code>{dl.pretty}</code> · valid: <strong>{String(dl.valid)}</strong>
          </p>
        </Wrap>
      )}
    </div>
  );
}

export const kyc: Story = {
  name: 'TkxKycInputs (PAN/VoterID/DL)',
  description: 'Indian KYC documents with format validation.',
  controls: {
    show: {
      type: 'select',
      options: ['all', 'pan', 'voter', 'dl'],
      default: 'all',
    },
  },
  render: (p) => <KycStory {...p} />,
};

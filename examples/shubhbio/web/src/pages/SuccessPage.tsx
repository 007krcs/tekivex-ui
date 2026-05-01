import { useNavigate, useParams } from 'react-router-dom';
import {
  TkxLayout,
  TkxButton,
  TkxCard,
  TkxResult,
  TkxPdfExport,
  TkxImageExport,
  TkxShareSheet,
  useTheme,
} from 'tekivex-ui';
import { useMemo } from 'react';
import { useBuilderStore } from '../stores/builderStore';
import { createBiodataRegistry } from '@shubhbio/templates';
import type { Biodata } from '@shubhbio/schemas';

const REGISTRY = createBiodataRegistry();

/**
 * Post-payment success screen. Phase 5 hooks PDF rendering against the same
 * scene the preview used. Phase 6 swaps the local export for a server-issued
 * single-use signed download URL via TkxSecureDownload.
 */
export function SuccessPage() {
  const { draftId = '' } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { biodata, templateId } = useBuilderStore();
  const template = useMemo(() => REGISTRY.get(templateId ?? ''), [templateId]);
  const scene = useMemo(
    () => (template ? template.build(biodata as Biodata, {}) : null),
    [template, biodata],
  );

  const fullName = biodata.personal?.fullName?.replace(/\s+/g, '_') ?? 'biodata';
  const fileBase = `${fullName}_${draftId.slice(0, 6)}`;

  return (
    <TkxLayout>
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '16px' }}>
        <TkxResult
          status="success"
          title="Payment received"
          subtitle="Your biodata is ready to download and share."
        />

        {scene && (
          <TkxCard style={{ padding: 16, marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <TkxPdfExport
              scene={scene}
              filename={`${fileBase}.pdf`}
              info={{ title: 'ShubhBio Biodata', author: 'ShubhBio' }}
              colorScheme="primary"
            >
              Download PDF
            </TkxPdfExport>
            <TkxImageExport scene={scene} filename={`${fileBase}.jpg`} mimeType="image/jpeg">
              Download Image
            </TkxImageExport>
          </TkxCard>
        )}

        <TkxCard style={{ padding: 16, marginTop: 16 }}>
          <h3 style={{ color: theme.text, marginBottom: 8 }}>Share</h3>
          <TkxShareSheet
            text={`I just made my biodata on ShubhBio.`}
            url={typeof window !== 'undefined' ? window.location.origin : ''}
          />
        </TkxCard>

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <TkxButton variant="ghost" onClick={() => navigate('/')}>
            Make another
          </TkxButton>
        </div>
      </main>
    </TkxLayout>
  );
}

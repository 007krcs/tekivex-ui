import { useNavigate, useParams } from 'react-router-dom';
import {
  TkxLayout,
  TkxButton,
  TkxBiodataPreview,
  TkxTemplateRenderer,
  useTheme,
} from 'tekivex-ui';
import { useBuilderStore } from '../stores/builderStore';
import { createBiodataRegistry } from '@shubhbio/templates';
import type { Biodata } from '@shubhbio/schemas';
import { useMemo } from 'react';

const REGISTRY = createBiodataRegistry();

/**
 * Locked, watermarked preview shown to the user before payment. Phase 4
 * couples the TkxBiodataPreview composite with audit-log piping.
 */
export function PreviewPage() {
  const { draftId = '' } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { biodata, templateId } = useBuilderStore();
  const template = useMemo(() => REGISTRY.get(templateId ?? ''), [templateId]);

  return (
    <TkxLayout>
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '16px' }}>
        <header style={{ marginBottom: 12 }}>
          <h1 style={{ fontSize: '1.5rem', color: theme.text }}>Preview</h1>
          <p style={{ color: theme.textMuted, fontSize: '0.875rem' }}>
            Pay ₹20 to download. Screenshots, prints, and clipboard are
            disabled until then. Each preview carries an invisible session
            watermark for traceability.
          </p>
        </header>

        {!template ? (
          <p style={{ color: theme.danger }}>Template not found.</p>
        ) : (
          <TkxBiodataPreview
            sessionId={draftId}
            watermarkLabel="ShubhBio"
            watermarkExtraLine="Preview only — pay to download"
            onAttempt={(evt) => {
              // Phase 4: pipe to engine/security.audit + a server telemetry
              // endpoint so repeated leak attempts can be flagged.
              if (typeof console !== 'undefined') {
                // eslint-disable-next-line no-console
                console.debug('[shubhbio.guard]', evt);
              }
            }}
          >
            <TkxTemplateRenderer
              template={template}
              data={biodata as Biodata}
              maxWidth={640}
            />
          </TkxBiodataPreview>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <TkxButton variant="ghost" onClick={() => navigate(-1)}>
            Edit
          </TkxButton>
          <TkxButton
            colorScheme="primary"
            onClick={() => navigate(`/pay/${draftId}`)}
          >
            Continue to payment
          </TkxButton>
        </div>
      </main>
    </TkxLayout>
  );
}

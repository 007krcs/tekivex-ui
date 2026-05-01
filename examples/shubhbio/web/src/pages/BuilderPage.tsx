import { useNavigate, useParams } from 'react-router-dom';
import { TkxLayout, TkxStepper, TkxButton, TkxCard, useTheme } from 'tekivex-ui';
import { useBuilderStore } from '../stores/builderStore';

const STEPS = [
  { label: 'Personal' },
  { label: 'Family' },
  { label: 'Education' },
  { label: 'Career' },
  { label: 'Religion' },
  { label: 'Photo' },
  { label: 'Preferences' },
] as const;

/**
 * Multi-step biodata builder. Phase 3 fleshes out each step with the right
 * Tekivex UI inputs (TkxInput, TkxDatePicker, TkxFieldArray, TkxImageCrop,
 * TkxPhoneInput, TkxMaskedInput) and Zod validation per step.
 */
export function BuilderPage() {
  const { templateId = 'hindu-traditional' } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { step, setStep, draftId } = useBuilderStore();

  const goPreview = () => {
    if (!draftId) return;
    navigate(`/preview/${draftId}`);
  };

  return (
    <TkxLayout>
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: '1.5rem', color: theme.text }}>
            Build your biodata
          </h1>
          <p style={{ color: theme.textMuted, fontSize: '0.875rem' }}>
            Template: <strong>{templateId}</strong>
          </p>
        </header>

        <TkxStepper
          steps={STEPS as unknown as Array<{ label: string }>}
          current={step}
          onStepClick={setStep}
        />

        <TkxCard variant="elevated" style={{ padding: 24, marginTop: 16 }}>
          <h2 style={{ fontSize: '1.125rem', color: theme.text }}>
            Step {step + 1} — {STEPS[step]?.label ?? '—'}
          </h2>
          <p style={{ color: theme.textMuted, marginTop: 8 }}>
            Phase 3 will render the inputs for this step (TkxInput,
            TkxDatePicker, TkxFieldArray, TkxImageCrop, TkxPhoneInput,
            TkxMaskedInput) with Zod validation against the religion-specific
            schema in <code>@shubhbio/schemas</code>.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 24,
              justifyContent: 'space-between',
            }}
          >
            <TkxButton
              variant="ghost"
              onClick={() => setStep(Math.max(0, step - 1))}
              isDisabled={step === 0}
            >
              Back
            </TkxButton>
            {step < STEPS.length - 1 ? (
              <TkxButton onClick={() => setStep(step + 1)}>Next</TkxButton>
            ) : (
              <TkxButton onClick={goPreview} colorScheme="primary">
                Preview
              </TkxButton>
            )}
          </div>
        </TkxCard>
      </main>
    </TkxLayout>
  );
}

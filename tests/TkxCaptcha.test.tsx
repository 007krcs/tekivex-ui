import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { TkxCaptcha } from '../src/components/TkxCaptcha';

describe('TkxCaptcha', () => {
  it('auto-verifies in test mode', async () => {
    const onVerify = vi.fn();
    render(
      <TkxCaptcha
        provider="turnstile"
        sitekey="0x4AAAAAAA_test_key_for_demo_only_"
        testMode
        onVerify={onVerify}
      />,
    );
    await waitFor(() => expect(onVerify).toHaveBeenCalledWith('TEST_TOKEN'), { timeout: 1000 });
  });

  it('does not throw when sitekey is invalid (warns instead)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <TkxCaptcha
        provider="turnstile"
        sitekey="bad"
        testMode
        onVerify={() => {}}
      />,
    );
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('renders the test-mode placeholder', () => {
    const { getByText } = render(
      <TkxCaptcha
        provider="hcaptcha"
        sitekey="0x4AAAAAAA_test_key_for_demo_only_"
        testMode
        onVerify={() => {}}
      />,
    );
    expect(getByText(/test mode/i)).toBeInTheDocument();
  });
});

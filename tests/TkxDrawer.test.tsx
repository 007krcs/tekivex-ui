import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxDrawer } from '../src/components/TkxDrawer';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxDrawer', () => {
  it('renders children when open', () => {
    render(
      <TkxDrawer isOpen onClose={() => {}}>
        <p>Drawer Content</p>
      </TkxDrawer>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Drawer Content')).toBeInTheDocument();
  });

  it('is hidden when closed', () => {
    render(
      <TkxDrawer isOpen={false} onClose={() => {}}>
        <p>Hidden Content</p>
      </TkxDrawer>,
      { wrapper: Wrapper },
    );
    expect(screen.queryByText('Hidden Content')).not.toBeVisible();
  });

  it('renders title when provided', () => {
    render(
      <TkxDrawer isOpen onClose={() => {}} title="Settings">
        <p>Body</p>
      </TkxDrawer>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('calls onClose when escape key is pressed', () => {
    const onClose = vi.fn();
    render(
      <TkxDrawer isOpen onClose={onClose} closeOnEsc>
        <p>Content</p>
      </TkxDrawer>,
      { wrapper: Wrapper },
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('renders footer when provided', () => {
    render(
      <TkxDrawer isOpen onClose={() => {}} footer={<button>Save</button>}>
        <p>Body</p>
      </TkxDrawer>,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  // ── A11y: dialog accessible name (a11y-audit MEDIUM #16) ──────────────────

  it('has a default accessible name when no title is provided', () => {
    render(
      <TkxDrawer isOpen onClose={() => {}}>
        <p>Untitled content</p>
      </TkxDrawer>,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Drawer');
  });

  it('uses the ariaLabel prop as the accessible name when untitled', () => {
    render(
      <TkxDrawer isOpen onClose={() => {}} ariaLabel="Filter options">
        <p>Untitled content</p>
      </TkxDrawer>,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Filter options');
  });

  it('is labelled by the title (ignoring ariaLabel) when a title is set', () => {
    render(
      <TkxDrawer isOpen onClose={() => {}} title="Settings" ariaLabel="ignored">
        <p>Body</p>
      </TkxDrawer>,
      { wrapper: Wrapper },
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('Settings');
    expect(dialog).not.toHaveAttribute('aria-label');
  });
});

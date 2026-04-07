import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxModal } from '../src/components/TkxModal';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxModal', () => {
  it('renders when isOpen is true', () => {
    render(
      <TkxModal isOpen onClose={() => {}} title="Test Modal">
        Modal content
      </TkxModal>,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <TkxModal isOpen={false} onClose={() => {}} title="Hidden Modal">
        Hidden content
      </TkxModal>,
      { wrapper: Wrapper },
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders title text', () => {
    render(
      <TkxModal isOpen onClose={() => {}} title="My Dialog">
        Content
      </TkxModal>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('My Dialog')).toBeInTheDocument();
  });

  it('has aria-modal attribute', () => {
    render(
      <TkxModal isOpen onClose={() => {}} title="Accessible Modal">
        Content
      </TkxModal>,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <TkxModal isOpen onClose={onClose} title="Closeable">
        Content
      </TkxModal>,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByLabelText('Close dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(
      <TkxModal isOpen onClose={onClose} title="Escape Modal">
        Content
      </TkxModal>,
      { wrapper: Wrapper },
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders footer when provided', () => {
    render(
      <TkxModal isOpen onClose={() => {}} title="With Footer" footer={<button>Save</button>}>
        Content
      </TkxModal>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});

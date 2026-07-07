import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { I18nProvider } from '../src/i18n/I18nProvider';
import { TkxSelect } from '../src/components/TkxSelect';
import { TkxSnackbar } from '../src/components/TkxSnackbar';
import { TkxCommandPalette } from '../src/components/TkxCommandPalette';

// Wrap with a theme + an I18nProvider whose `strings` override the newly-wired
// keys, proving each component reads them instead of hardcoding English.
function L({ strings, children }: { strings: Record<string, string>; children: React.ReactNode }) {
  return (
    <ThemeProvider theme={quantumDark}>
      <I18nProvider locale="en-US" strings={strings}>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}

describe('i18n sweep — previously-hardcoded strings now localize', () => {
  it('TkxSelect empty state uses selectNoOptions', () => {
    render(
      <L strings={{ selectNoOptions: 'Aucune option' }}>
        <TkxSelect options={[]} searchable label="X" />
      </L>,
    );
    // Open the listbox to reveal the empty state.
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('Aucune option')).toBeTruthy();
    expect(screen.queryByText('No options found')).toBeNull();
  });

  it('TkxSnackbar dismiss button uses the dismiss key', () => {
    render(
      <L strings={{ dismiss: 'Schließen-X' }}>
        <TkxSnackbar isOpen message="hi" onClose={() => {}} />
      </L>,
    );
    expect(screen.getByLabelText('Schließen-X')).toBeTruthy();
  });

  it('TkxCommandPalette dialog label uses commandPalette', () => {
    render(
      <L strings={{ commandPalette: 'Palette de commandes' }}>
        <TkxCommandPalette open commands={[{ id: 'a', label: 'Alpha', onSelect: () => {} }]} />
      </L>,
    );
    expect(screen.getByLabelText('Palette de commandes')).toBeTruthy();
  });

  it('English default is unchanged when no override is supplied', () => {
    render(
      <L strings={{}}>
        <TkxSelect options={[]} searchable label="X" />
      </L>,
    );
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('No options found')).toBeTruthy();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxAccordion } from '../src/components/TkxAccordion';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const items = [
  { id: '1', title: 'Section One', content: 'Content of section one' },
  { id: '2', title: 'Section Two', content: 'Content of section two' },
  { id: '3', title: 'Section Three', content: 'Content of section three' },
];

describe('TkxAccordion', () => {
  it('renders all items', () => {
    render(<TkxAccordion items={items} />, { wrapper: Wrapper });
    expect(screen.getByText('Section One')).toBeInTheDocument();
    expect(screen.getByText('Section Two')).toBeInTheDocument();
    expect(screen.getByText('Section Three')).toBeInTheDocument();
  });

  it('has aria-expanded="false" by default', () => {
    render(<TkxAccordion items={items} />, { wrapper: Wrapper });
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('opens a section when clicked', () => {
    render(<TkxAccordion items={items} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('Section One'));
    const btn = screen.getByText('Section One').closest('button');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes an open section when clicked again', () => {
    render(<TkxAccordion items={items} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('Section One'));
    expect(screen.getByText('Section One').closest('button')).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByText('Section One'));
    expect(screen.getByText('Section One').closest('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders with defaultOpen item', () => {
    render(<TkxAccordion items={items} defaultOpen="2" />, { wrapper: Wrapper });
    const secondBtn = screen.getByText('Section Two').closest('button');
    expect(secondBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('calls onChange with the opened item id', () => {
    const onChange = vi.fn();
    render(<TkxAccordion items={items} onChange={onChange} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('Section Two'));
    expect(onChange).toHaveBeenCalledWith('2');
  });

  it('does not open disabled items', () => {
    const disabledItems = [
      { id: '1', title: 'Disabled', content: 'Hidden', disabled: true },
    ];
    render(<TkxAccordion items={disabledItems} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('Disabled'));
    expect(screen.getByText('Disabled').closest('button')).toHaveAttribute('aria-expanded', 'false');
  });
});

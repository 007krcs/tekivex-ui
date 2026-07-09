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

  // Regression (a11y MEDIUM): a collapsed panel was only visually clipped
  // (height:0 + overflow:hidden) but stayed in the accessibility tree and tab
  // order. It must be aria-hidden + inert while collapsed, and exposed again
  // when opened.
  it('hides collapsed panel content from AT and tab order', () => {
    render(<TkxAccordion items={items} />, { wrapper: Wrapper });

    const trigger = screen.getByText('Section One').closest('button')!;
    const panelId = trigger.getAttribute('aria-controls')!;
    const panel = document.getElementById(panelId)!;

    // Initially collapsed → hidden from AT and inert (unfocusable content).
    expect(panel).toHaveAttribute('aria-hidden', 'true');
    expect(panel.hasAttribute('inert')).toBe(true);

    // Open → panel content exposed again.
    fireEvent.click(trigger);
    expect(panel).not.toHaveAttribute('aria-hidden');
    expect(panel.hasAttribute('inert')).toBe(false);
  });

  it('re-hides the panel once the collapse transition finishes', () => {
    render(<TkxAccordion items={items} defaultOpen="1" />, { wrapper: Wrapper });

    const trigger = screen.getByText('Section One').closest('button')!;
    const panelId = trigger.getAttribute('aria-controls')!;
    const panel = document.getElementById(panelId)!;
    expect(panel).not.toHaveAttribute('aria-hidden');

    // Collapse; while the height transition runs the panel stays measurable,
    // and only on transitionend does it become hidden/inert.
    fireEvent.click(trigger);
    fireEvent.transitionEnd(panel, { propertyName: 'height' });
    expect(panel).toHaveAttribute('aria-hidden', 'true');
    expect(panel.hasAttribute('inert')).toBe(true);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxTabs, TkxTabList, TkxTab, TkxTabPanels, TkxTabPanel } from '../src/components/TkxTabs';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

function TabsFixture({ onChange }: { onChange?: (i: number) => void }) {
  return (
    <TkxTabs defaultIndex={0} onChange={onChange} tabCount={3}>
      <TkxTabList>
        <TkxTab index={0}>Tab 1</TkxTab>
        <TkxTab index={1}>Tab 2</TkxTab>
        <TkxTab index={2} disabled>Tab 3</TkxTab>
      </TkxTabList>
      <TkxTabPanels>
        <TkxTabPanel index={0}>Panel 1 content</TkxTabPanel>
        <TkxTabPanel index={1}>Panel 2 content</TkxTabPanel>
        <TkxTabPanel index={2}>Panel 3 content</TkxTabPanel>
      </TkxTabPanels>
    </TkxTabs>
  );
}

describe('TkxTabs', () => {
  it('renders tab buttons', () => {
    render(<TabsFixture />, { wrapper: Wrapper });
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('renders tablist role', () => {
    render(<TabsFixture />, { wrapper: Wrapper });
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('shows first panel by default', () => {
    render(<TabsFixture />, { wrapper: Wrapper });
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel 1 content');
  });

  it('switches panel when a tab is clicked', () => {
    render(<TabsFixture />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('Tab 2'));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel 2 content');
  });

  it('sets aria-selected on active tab', () => {
    render(<TabsFixture />, { wrapper: Wrapper });
    expect(screen.getByText('Tab 1')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Tab 2')).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange when switching tabs', () => {
    const onChange = vi.fn();
    render(<TabsFixture onChange={onChange} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('Tab 2'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('disabled tab does not switch panel', () => {
    render(<TabsFixture />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('Tab 3'));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel 1 content');
  });

  // ── Keyboard navigation (derived tab count, disabled skipping) ────────────
  // Regression for A11Y-AUDIT MEDIUM #9/#10: arrow navigation must work
  // WITHOUT a hand-supplied tabCount prop, and must skip disabled tabs.

  function KeyboardFixture() {
    return (
      <TkxTabs defaultIndex={0}>
        <TkxTabList>
          <TkxTab index={0}>Tab 1</TkxTab>
          <TkxTab index={1}>Tab 2</TkxTab>
          <TkxTab index={2} disabled>Tab 3</TkxTab>
          <TkxTab index={3}>Tab 4</TkxTab>
        </TkxTabList>
        <TkxTabPanels>
          <TkxTabPanel index={0}>Panel 1 content</TkxTabPanel>
          <TkxTabPanel index={1}>Panel 2 content</TkxTabPanel>
          <TkxTabPanel index={2}>Panel 3 content</TkxTabPanel>
          <TkxTabPanel index={3}>Panel 4 content</TkxTabPanel>
        </TkxTabPanels>
      </TkxTabs>
    );
  }

  describe('keyboard navigation', () => {
    it('ArrowRight moves to the next tab WITHOUT a tabCount prop', () => {
      render(<KeyboardFixture />, { wrapper: Wrapper });
      fireEvent.keyDown(screen.getByText('Tab 1'), { key: 'ArrowRight' });
      expect(screen.getByText('Tab 2')).toHaveAttribute('aria-selected', 'true');
      expect(document.activeElement).toBe(screen.getByText('Tab 2'));
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel 2 content');
    });

    it('ArrowRight skips a disabled tab', () => {
      render(<KeyboardFixture />, { wrapper: Wrapper });
      // From Tab 2, ArrowRight must land on Tab 4 (Tab 3 is disabled)
      fireEvent.keyDown(screen.getByText('Tab 2'), { key: 'ArrowRight' });
      expect(screen.getByText('Tab 4')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Tab 3')).toHaveAttribute('aria-selected', 'false');
      expect(document.activeElement).toBe(screen.getByText('Tab 4'));
    });

    it('ArrowLeft skips a disabled tab (wrapping direction)', () => {
      render(<KeyboardFixture />, { wrapper: Wrapper });
      // From Tab 4, ArrowLeft must land on Tab 2 (skipping disabled Tab 3)
      fireEvent.keyDown(screen.getByText('Tab 4'), { key: 'ArrowLeft' });
      expect(screen.getByText('Tab 2')).toHaveAttribute('aria-selected', 'true');
    });

    it('ArrowRight wraps from the last tab to the first', () => {
      render(<KeyboardFixture />, { wrapper: Wrapper });
      fireEvent.keyDown(screen.getByText('Tab 4'), { key: 'ArrowRight' });
      expect(screen.getByText('Tab 1')).toHaveAttribute('aria-selected', 'true');
    });

    it('End moves to the last enabled tab (skipping a disabled last tab)', () => {
      // Original 3-tab fixture: Tab 3 (last) is disabled → End lands on Tab 2
      render(<TabsFixture />, { wrapper: Wrapper });
      fireEvent.keyDown(screen.getByText('Tab 1'), { key: 'End' });
      expect(screen.getByText('Tab 2')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Tab 3')).toHaveAttribute('aria-selected', 'false');
    });

    it('Home moves to the first tab', () => {
      render(<KeyboardFixture />, { wrapper: Wrapper });
      fireEvent.keyDown(screen.getByText('Tab 1'), { key: 'ArrowRight' });
      fireEvent.keyDown(screen.getByText('Tab 2'), { key: 'Home' });
      expect(screen.getByText('Tab 1')).toHaveAttribute('aria-selected', 'true');
    });
  });
});

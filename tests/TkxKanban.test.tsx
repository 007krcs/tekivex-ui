import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxKanban, type TkxKanbanColumn } from '../src/components/TkxKanban';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const COLUMNS: TkxKanbanColumn[] = [
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      { id: 'c1', title: 'Card 1' },
      { id: 'c2', title: 'Card 2' },
    ],
  },
  {
    id: 'doing',
    title: 'In Progress',
    wipLimit: 2,
    cards: [{ id: 'c3', title: 'Card 3' }],
  },
  { id: 'done', title: 'Done', cards: [] },
];

describe('TkxKanban', () => {
  it('renders all columns + cards', () => {
    render(<TkxKanban columns={COLUMNS} onReorder={() => {}} />, { wrapper: W });
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
    expect(screen.getByText('Card 3')).toBeInTheDocument();
  });

  it('renders WIP limit indicator', () => {
    render(<TkxKanban columns={COLUMNS} onReorder={() => {}} />, { wrapper: W });
    // "1 / 2" in the In Progress column
    expect(screen.getByLabelText(/1 of 2 cards/)).toBeInTheDocument();
  });

  it('renders empty-column placeholder', () => {
    render(<TkxKanban columns={COLUMNS} onReorder={() => {}} />, { wrapper: W });
    expect(screen.getByText('No cards')).toBeInTheDocument();
  });

  it('uses ARIA grid pattern', () => {
    const { container } = render(
      <TkxKanban columns={COLUMNS} onReorder={() => {}} />,
      { wrapper: W },
    );
    expect(container.querySelector('[role="grid"]')).toBeTruthy();
    expect(container.querySelectorAll('[role="row"]')).toHaveLength(3);
    expect(container.querySelectorAll('[role="gridcell"]')).toHaveLength(3);
  });

  it('keyboard pickup announces via live region', () => {
    const { container } = render(
      <TkxKanban columns={COLUMNS} onReorder={() => {}} />,
      { wrapper: W },
    );
    const card = container.querySelector('[role="gridcell"]') as HTMLElement;
    fireEvent.keyDown(card, { key: ' ' });
    const live = container.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toMatch(/Grabbed/);
  });

  it('keyboard ArrowDown updates target index', () => {
    const onReorder = vi.fn();
    const { container } = render(
      <TkxKanban columns={COLUMNS} onReorder={onReorder} />,
      { wrapper: W },
    );
    const firstCard = container.querySelectorAll('[role="gridcell"]')[0] as HTMLElement;
    fireEvent.keyDown(firstCard, { key: ' ' }); // pickup
    fireEvent.keyDown(firstCard, { key: 'ArrowDown' });
    fireEvent.keyDown(firstCard, { key: 'Enter' }); // drop
    expect(onReorder).toHaveBeenCalledWith(
      expect.objectContaining({
        cardId: 'c1',
        fromColumnId: 'todo',
        fromIndex: 0,
        toIndex: 1,
      }),
    );
  });

  it('keyboard ArrowRight moves to next column', () => {
    const onReorder = vi.fn();
    const { container } = render(
      <TkxKanban columns={COLUMNS} onReorder={onReorder} />,
      { wrapper: W },
    );
    const card = container.querySelectorAll('[role="gridcell"]')[0] as HTMLElement;
    fireEvent.keyDown(card, { key: ' ' }); // pickup
    fireEvent.keyDown(card, { key: 'ArrowRight' });
    fireEvent.keyDown(card, { key: 'Enter' }); // drop
    expect(onReorder).toHaveBeenCalledWith(
      expect.objectContaining({
        cardId: 'c1',
        fromColumnId: 'todo',
        toColumnId: 'doing',
      }),
    );
  });

  it('Escape cancels drag without reorder', () => {
    const onReorder = vi.fn();
    const { container } = render(
      <TkxKanban columns={COLUMNS} onReorder={onReorder} />,
      { wrapper: W },
    );
    const card = container.querySelectorAll('[role="gridcell"]')[0] as HTMLElement;
    fireEvent.keyDown(card, { key: ' ' });
    fireEvent.keyDown(card, { key: 'ArrowDown' });
    fireEvent.keyDown(card, { key: 'Escape' });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('respects isDragDisabled at board + card level', () => {
    const { container } = render(
      <TkxKanban columns={COLUMNS} onReorder={() => {}} isDragDisabled />,
      { wrapper: W },
    );
    const card = container.querySelectorAll('[role="gridcell"]')[0] as HTMLElement;
    fireEvent.keyDown(card, { key: ' ' });
    const live = container.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toBe('');
  });

  it('renders custom card via renderCard', () => {
    render(
      <TkxKanban
        columns={COLUMNS}
        onReorder={() => {}}
        renderCard={(card) => <div data-testid="custom">{card.title} ★</div>}
      />,
      { wrapper: W },
    );
    expect(screen.getAllByTestId('custom').length).toBe(3);
    expect(screen.getByText('Card 1 ★')).toBeInTheDocument();
  });

  it('renders badges + assignee in default card renderer', () => {
    const cols: TkxKanbanColumn[] = [
      {
        id: 'a',
        title: 'A',
        cards: [
          {
            id: 'x',
            title: 'Tagged card',
            badges: [{ label: 'P0' }, { label: 'frontend' }],
            assignee: { name: 'Aisha' },
          },
        ],
      },
    ];
    render(<TkxKanban columns={cols} onReorder={() => {}} />, { wrapper: W });
    expect(screen.getByText('P0')).toBeInTheDocument();
    expect(screen.getByText('frontend')).toBeInTheDocument();
    expect(screen.getByText('Aisha')).toBeInTheDocument();
  });

  it('onCardClick fires when card is clicked outside drag', () => {
    const onCardClick = vi.fn();
    render(
      <TkxKanban columns={COLUMNS} onReorder={() => {}} onCardClick={onCardClick} />,
      { wrapper: W },
    );
    fireEvent.click(screen.getByText('Card 1'));
    expect(onCardClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'c1' }),
      expect.objectContaining({ id: 'todo' }),
    );
  });
});

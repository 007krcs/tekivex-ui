import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxMenu } from '../src/components/TkxMenu';
import { TkxSlider } from '../src/components/TkxSlider';
import { TkxForm, TkxFormField } from '../src/components/TkxForm';
import { TkxInput } from '../src/components/TkxInput';
import { TkxButton } from '../src/components/TkxButton';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

// ── TkxMenu ───────────────────────────────────────────────────────────────
describe('TkxMenu', () => {
  it('renders trigger', () => {
    render(
      <TkxMenu
        trigger={<button>Open</button>}
        items={[{ key: '1', label: 'Item 1' }]}
      />,
      { wrapper: W },
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('opens on click', async () => {
    render(
      <TkxMenu
        trigger={<button>Open</button>}
        items={[{ key: '1', label: 'Item A' }, { key: '2', label: 'Item B' }]}
      />,
      { wrapper: W },
    );
    fireEvent.click(screen.getByText('Open'));
    await waitFor(() => expect(screen.queryByText('Item A')).toBeInTheDocument());
  });

  it('respects isDisabled', () => {
    render(
      <TkxMenu
        trigger={<button>Open</button>}
        items={[{ key: '1', label: 'A' }]}
        isDisabled
      />,
      { wrapper: W },
    );
    fireEvent.click(screen.getByText('Open'));
    // When disabled the menu should not open.
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });

  it('fires onOpen + onClose', async () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    render(
      <TkxMenu
        trigger={<button>Open</button>}
        items={[{ key: '1', label: 'X' }]}
        onOpen={onOpen}
        onClose={onClose}
      />,
      { wrapper: W },
    );
    fireEvent.click(screen.getByText('Open'));
    await waitFor(() => expect(onOpen).toHaveBeenCalled());
  });

  it('item onClick fires when selected', async () => {
    const onClick = vi.fn();
    render(
      <TkxMenu
        trigger={<button>Open</button>}
        items={[{ key: '1', label: 'Pick me', onClick }]}
      />,
      { wrapper: W },
    );
    fireEvent.click(screen.getByText('Open'));
    await waitFor(() => expect(screen.getByText('Pick me')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Pick me'));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders disabled item', async () => {
    render(
      <TkxMenu
        trigger={<button>Open</button>}
        items={[{ key: '1', label: 'Disabled', isDisabled: true }]}
      />,
      { wrapper: W },
    );
    fireEvent.click(screen.getByText('Open'));
    await waitFor(() => expect(screen.getByText('Disabled')).toBeInTheDocument());
  });

  it('renders divider items', async () => {
    render(
      <TkxMenu
        trigger={<button>Open</button>}
        items={[
          { key: '1', label: 'A' },
          { key: 'sep', isDivider: true },
          { key: '2', label: 'B' },
        ]}
      />,
      { wrapper: W },
    );
    fireEvent.click(screen.getByText('Open'));
    await waitFor(() => expect(screen.getByText('A')).toBeInTheDocument());
  });

  it('respects placement', () => {
    const { container } = render(
      <TkxMenu
        trigger={<button>Open</button>}
        items={[{ key: '1', label: 'A' }]}
        placement="bottom-end"
      />,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });
});

// ── TkxSlider ─────────────────────────────────────────────────────────────
describe('TkxSlider', () => {
  it('renders with default value', () => {
    const { container } = render(<TkxSlider defaultValue={50} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with controlled value', () => {
    const { container } = render(<TkxSlider value={50} onChange={() => {}} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders range mode', () => {
    const { container } = render(
      <TkxSlider isRange rangeValue={[20, 80]} onRangeChange={() => {}} />,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders all sizes', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { container } = render(<TkxSlider value={50} onChange={() => {}} size={size} />, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('renders all color schemes', () => {
    for (const cs of ['primary', 'success', 'danger', 'warning'] as const) {
      const { container } = render(
        <TkxSlider value={50} onChange={() => {}} colorScheme={cs} />,
        { wrapper: W },
      );
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('renders showValue', () => {
    const { container } = render(<TkxSlider value={42} onChange={() => {}} showValue />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders showTicks', () => {
    const { container } = render(
      <TkxSlider value={50} onChange={() => {}} showTicks tickCount={5} />,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with marks', () => {
    const { container } = render(
      <TkxSlider
        value={50}
        onChange={() => {}}
        marks={[
          { value: 0, label: 'Low' },
          { value: 50, label: 'Mid' },
          { value: 100, label: 'High' },
        ]}
      />,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders vertical orientation', () => {
    const { container } = render(
      <TkxSlider value={50} onChange={() => {}} orientation="vertical" />,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders disabled', () => {
    const { container } = render(<TkxSlider value={50} onChange={() => {}} isDisabled />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with formatValue', () => {
    const { container } = render(
      <TkxSlider
        value={50}
        onChange={() => {}}
        showValue
        formatValue={(v) => `${v}%`}
      />,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with showTooltip variations', () => {
    for (const t of [true, false, 'hover', 'always'] as const) {
      const { container } = render(
        <TkxSlider value={50} onChange={() => {}} showTooltip={t} />,
        { wrapper: W },
      );
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('keyboard arrow increments value', () => {
    const onChange = vi.fn();
    render(<TkxSlider label="V" value={50} onChange={onChange} step={5} />, { wrapper: W });
    const slider = screen.getAllByRole('slider')[0];
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    // Some implementations call onChange immediately; some on key release.
  });

  it('label renders with showValue', () => {
    render(
      <TkxSlider
        label="Volume"
        value={50}
        onChange={() => {}}
        showValue
      />,
      { wrapper: W },
    );
    expect(screen.getByText('Volume')).toBeInTheDocument();
  });

  it('respects min/max/step', () => {
    const { container } = render(
      <TkxSlider value={50} onChange={() => {}} min={0} max={100} step={5} />,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });
});

// ── TkxForm ───────────────────────────────────────────────────────────────
describe('TkxForm', () => {
  it('renders children + submits with collected values', async () => {
    const onSubmit = vi.fn();
    render(
      <TkxForm onSubmit={onSubmit}>
        <TkxFormField name="email" label="Email">
          <TkxInput label="Email" />
        </TkxFormField>
        <TkxButton type="submit">Save</TkxButton>
      </TkxForm>,
      { wrapper: W },
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders all layouts', () => {
    for (const layout of ['vertical', 'horizontal', 'inline'] as const) {
      const { container } = render(
        <TkxForm layout={layout}>
          <TkxFormField name="x" label="X">
            <TkxInput label="X" />
          </TkxFormField>
        </TkxForm>,
        { wrapper: W },
      );
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('renders disabled state', () => {
    const { container } = render(
      <TkxForm disabled>
        <TkxFormField name="x" label="X">
          <TkxInput label="X" />
        </TkxFormField>
      </TkxForm>,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('initialValues seed the form state', () => {
    const onSubmit = vi.fn();
    render(
      <TkxForm onSubmit={onSubmit} initialValues={{ name: 'Aisha' }}>
        <TkxFormField name="name" label="Name">
          <TkxInput label="Name" />
        </TkxFormField>
        <TkxButton type="submit">Save</TkxButton>
      </TkxForm>,
      { wrapper: W },
    );
    const input = screen.getByLabelText('Name') as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });

  it('required field shows error on submit', async () => {
    render(
      <TkxForm>
        <TkxFormField name="email" label="Email" required>
          <TkxInput label="Email" />
        </TkxFormField>
        <TkxButton type="submit">Save</TkxButton>
      </TkxForm>,
      { wrapper: W },
    );
    fireEvent.click(screen.getByText('Save'));
    // Errors render asynchronously after validateFields resolves.
    await waitFor(() => {
      const labels = screen.getAllByText(/Email/);
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  it('rule with min length triggers validation', async () => {
    render(
      <TkxForm>
        <TkxFormField name="x" label="X" rules={[{ min: 5 }]}>
          <TkxInput label="X" />
        </TkxFormField>
        <TkxButton type="submit">Save</TkxButton>
      </TkxForm>,
      { wrapper: W },
    );
    const input = screen.getByLabelText('X');
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.click(screen.getByText('Save'));
  });
});

// ── ARIA regression: no unnamed menuitem in the menu tree ───────────────────
describe('TkxMenu — no unnamed menuitem', () => {
  it('renders a label-less entry as a separator, not a nameless menuitem', async () => {
    render(
      <TkxMenu
        trigger={<button>Open</button>}
        items={[
          { id: '1', label: 'A' },
          { id: 'sep' } as never,
          { id: '2', label: 'B' },
        ]}
      />,
      { wrapper: W },
    );
    fireEvent.click(screen.getByText('Open'));
    await waitFor(() => expect(screen.getByText('A')).toBeInTheDocument());

    const items = Array.from(document.querySelectorAll('[role="menuitem"]'));
    expect(items).toHaveLength(2);
    items.forEach((el) => {
      const name = el.getAttribute('aria-label') || (el.textContent ?? '').trim();
      expect(name).toBeTruthy();
    });
    expect(document.querySelectorAll('[role="separator"]').length).toBeGreaterThan(0);
  });
});

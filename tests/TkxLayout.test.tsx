import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxLayout, TkxHeader, TkxContent, TkxFooter, TkxSider } from '../src/components/TkxLayout';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxLayout', () => {
  it('renders children', () => {
    render(
      <TkxLayout>
        <div>Layout content</div>
      </TkxLayout>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Layout content')).toBeInTheDocument();
  });

  it('renders header, content, and footer', () => {
    render(
      <TkxLayout>
        <TkxHeader>App Header</TkxHeader>
        <TkxContent>Main Content</TkxContent>
        <TkxFooter>App Footer</TkxFooter>
      </TkxLayout>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('App Header')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
    expect(screen.getByText('App Footer')).toBeInTheDocument();
  });

  it('renders with sider', () => {
    render(
      <TkxLayout hasSider>
        <TkxSider>Side Navigation</TkxSider>
        <TkxContent>Page Content</TkxContent>
      </TkxLayout>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Side Navigation')).toBeInTheDocument();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('renders header as banner landmark', () => {
    render(
      <TkxLayout>
        <TkxHeader>My Header</TkxHeader>
        <TkxContent>Body</TkxContent>
      </TkxLayout>,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders footer as contentinfo landmark', () => {
    render(
      <TkxLayout>
        <TkxContent>Body</TkxContent>
        <TkxFooter>My Footer</TkxFooter>
      </TkxLayout>,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});

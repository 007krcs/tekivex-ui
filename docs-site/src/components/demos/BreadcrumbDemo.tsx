import { TkxBreadcrumb } from 'tekivex-ui';
import { Preview } from '../Preview';

export function BreadcrumbBasic() {
  return (
    <Preview label="Basic — three levels with current page">
      <TkxBreadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Components', href: '/components/' },
          { label: 'Breadcrumb' },
        ]}
      />
    </Preview>
  );
}

export function BreadcrumbCustomSeparator() {
  return (
    <Preview label="Custom separator" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxBreadcrumb
        separator="›"
        items={[
          { label: 'Docs', href: '/docs' },
          { label: 'Recipes', href: '/recipes/' },
          { label: 'India address form' },
        ]}
      />
      <TkxBreadcrumb
        separator="/"
        items={[
          { label: 'app', href: '/' },
          { label: 'settings', href: '/settings' },
          { label: 'profile' },
        ]}
      />
    </Preview>
  );
}

export function BreadcrumbDeep() {
  return (
    <Preview label="Deep navigation — file-system style">
      <TkxBreadcrumb
        items={[
          { label: 'Drive', href: '/' },
          { label: '2026', href: '/2026' },
          { label: 'Q2', href: '/2026/q2' },
          { label: 'Reports', href: '/2026/q2/reports' },
          { label: 'Revenue', href: '/2026/q2/reports/revenue' },
          { label: 'May.xlsx' },
        ]}
      />
    </Preview>
  );
}

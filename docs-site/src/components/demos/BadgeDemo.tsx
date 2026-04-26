import { TkxBadge } from 'tekivex-ui';
import { Preview } from '../Preview';

export function BadgeVariants() {
  return (
    <Preview label="Variants">
      <TkxBadge variant="primary">primary</TkxBadge>
      <TkxBadge variant="secondary">secondary</TkxBadge>
      <TkxBadge variant="success">success</TkxBadge>
      <TkxBadge variant="warning">warning</TkxBadge>
      <TkxBadge variant="danger">danger</TkxBadge>
      <TkxBadge variant="info">info</TkxBadge>
    </Preview>
  );
}

export function BadgeSizes() {
  return (
    <Preview label="Sizes">
      <TkxBadge size="sm" variant="primary">sm</TkxBadge>
      <TkxBadge size="md" variant="primary">md</TkxBadge>
      <TkxBadge size="lg" variant="primary">lg</TkxBadge>
    </Preview>
  );
}

export function BadgeOutlined() {
  return (
    <Preview label="Outlined">
      <TkxBadge variant="primary" outlined>v2.7</TkxBadge>
      <TkxBadge variant="success" outlined>open source</TkxBadge>
      <TkxBadge variant="warning" outlined>preview</TkxBadge>
    </Preview>
  );
}

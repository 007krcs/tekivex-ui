import { TkxList, TkxAvatar, TkxButton, TkxBadge } from 'tekivex-ui';
import { Preview } from '../Preview';

export function ListBasic() {
  return (
    <Preview label="Basic — bordered list">
      <div style={{ width: '100%', maxWidth: 480 }}>
        <TkxList
          bordered
          items={[
            { key: '1', title: 'README.md', description: 'Last edited 2 hours ago' },
            { key: '2', title: 'CHANGELOG.md', description: 'Last edited yesterday' },
            { key: '3', title: 'package.json', description: 'Last edited 3 days ago' },
          ]}
        />
      </div>
    </Preview>
  );
}

export function ListWithAvatars() {
  return (
    <Preview label="With avatars + action buttons">
      <div style={{ width: '100%', maxWidth: 480 }}>
        <TkxList
          bordered
          items={[
            {
              key: '1',
              title: 'Priya Kumar',
              description: 'priya@example.com',
              avatar: <TkxAvatar name="Priya Kumar" />,
              actions: <TkxButton size="sm" variant="outline">Invite</TkxButton>,
            },
            {
              key: '2',
              title: 'Marcus Lee',
              description: 'marcus@example.com',
              avatar: <TkxAvatar name="Marcus Lee" />,
              actions: <TkxButton size="sm" variant="outline">Invite</TkxButton>,
            },
            {
              key: '3',
              title: 'Sara Chen',
              description: 'sara@example.com',
              avatar: <TkxAvatar name="Sara Chen" />,
              actions: <TkxButton size="sm" variant="outline">Invite</TkxButton>,
            },
          ]}
        />
      </div>
    </Preview>
  );
}

export function ListWithExtra() {
  return (
    <Preview label="With extra / badge metadata">
      <div style={{ width: '100%', maxWidth: 480 }}>
        <TkxList
          bordered
          items={[
            { key: '1', title: 'Production', description: 'us-east-1', extra: <TkxBadge variant="success">healthy</TkxBadge> },
            { key: '2', title: 'Staging', description: 'us-east-1', extra: <TkxBadge variant="warning">degraded</TkxBadge> },
            { key: '3', title: 'Dev', description: 'eu-west-1', extra: <TkxBadge variant="danger">down</TkxBadge> },
          ]}
        />
      </div>
    </Preview>
  );
}

export function ListLoading() {
  return (
    <Preview label="Loading state">
      <div style={{ width: '100%', maxWidth: 480 }}>
        <TkxList loading items={[]} />
      </div>
    </Preview>
  );
}

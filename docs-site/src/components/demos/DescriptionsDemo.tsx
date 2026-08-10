import { TkxDescriptions, TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

const USER_ITEMS = [
  { key: 'name', label: 'Name', children: 'Ada Lovelace' },
  { key: 'email', label: 'Email', children: 'ada@example.com' },
  { key: 'role', label: 'Role', children: 'Admin' },
  { key: 'team', label: 'Team', children: 'Platform' },
  { key: 'location', label: 'Location', children: 'London' },
  { key: 'joined', label: 'Joined', children: '10 Dec 1815' },
  { key: 'bio', label: 'Bio', children: 'Wrote the first published algorithm intended for a machine.', span: 3 },
];

export function DescriptionsBasic() {
  return (
    <Preview label="Plain <dl> grid" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 360 }}>
        <TkxDescriptions
          title="User Info"
          extra={<TkxButton size="sm">Edit</TkxButton>}
          items={USER_ITEMS}
        />
      </div>
    </Preview>
  );
}

export function DescriptionsBordered() {
  return (
    <Preview label="bordered + size='small'" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 360 }}>
        <TkxDescriptions title="User Info" items={USER_ITEMS} bordered size="small" column={2} />
      </div>
    </Preview>
  );
}

export function DescriptionsVertical() {
  return (
    <Preview label="layout='vertical'" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 360 }}>
        <TkxDescriptions
          items={USER_ITEMS.slice(0, 4)}
          layout="vertical"
          column={2}
          bordered
        />
      </div>
    </Preview>
  );
}

import { TkxPopover, TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

export function PopoverBasic() {
  return (
    <Preview label="Basic — click trigger to open">
      <TkxPopover
        trigger={<TkxButton variant="outline">More info</TkxButton>}
        content={
          <div style={{ padding: 8, maxWidth: 220 }}>
            <strong style={{ fontSize: 13 }}>About this metric</strong>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
              Daily active users — distinct accounts that performed at
              least one action in the last 24 hours.
            </p>
          </div>
        }
      />
    </Preview>
  );
}

export function PopoverPlacements() {
  return (
    <Preview label="Placement options" style={{ flexDirection: 'column', alignItems: 'center', gap: 12, padding: '60px 20px' }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <TkxPopover trigger={<TkxButton size="sm" variant="outline">top</TkxButton>} placement="top" content={<span style={{ padding: 8 }}>Top placement</span>} />
        <TkxPopover trigger={<TkxButton size="sm" variant="outline">bottom</TkxButton>} placement="bottom" content={<span style={{ padding: 8 }}>Bottom placement</span>} />
        <TkxPopover trigger={<TkxButton size="sm" variant="outline">left</TkxButton>} placement="left" content={<span style={{ padding: 8 }}>Left placement</span>} />
        <TkxPopover trigger={<TkxButton size="sm" variant="outline">right</TkxButton>} placement="right" content={<span style={{ padding: 8 }}>Right placement</span>} />
      </div>
    </Preview>
  );
}

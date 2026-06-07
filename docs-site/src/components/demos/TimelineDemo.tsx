import { TkxTimeline } from 'tekivex-ui';
import { Preview } from '../Preview';

export function TimelineBasic() {
  return (
    <Preview label="Vertical timeline">
      <div style={{ width: '100%', maxWidth: 480 }}>
        <TkxTimeline
          items={[
            { id: '1', title: 'Order placed',     description: 'Confirmation email sent.',           timestamp: '09:14 AM', status: 'success' },
            { id: '2', title: 'Payment received', description: 'Visa •••• 4242 charged ₹2,499.',     timestamp: '09:15 AM', status: 'success' },
            { id: '3', title: 'Packed',            description: 'Warehouse Mumbai — 2 items.',        timestamp: '11:02 AM', status: 'success' },
            { id: '4', title: 'In transit',        description: 'Out for delivery — courier en route.', timestamp: '02:48 PM', status: 'info' },
            { id: '5', title: 'Delivered',         description: 'Awaiting confirmation.',              status: 'default' },
          ]}
        />
      </div>
    </Preview>
  );
}

export function TimelineWithError() {
  return (
    <Preview label="With error step">
      <div style={{ width: '100%', maxWidth: 480 }}>
        <TkxTimeline
          items={[
            { id: '1', title: 'Build started',  timestamp: '09:14 AM', status: 'success' },
            { id: '2', title: 'Tests passed',   timestamp: '09:18 AM', status: 'success' },
            { id: '3', title: 'Deploy failed',  description: 'Astro overlay step did not produce output.', timestamp: '09:22 AM', status: 'error' },
            { id: '4', title: 'Retry queued',   status: 'default' },
          ]}
        />
      </div>
    </Preview>
  );
}

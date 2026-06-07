import { useState } from 'react';
import { TkxMentions } from 'tekivex-ui';
import { Preview } from '../Preview';

const PEOPLE = [
  { value: 'priya',  label: 'Priya Kumar' },
  { value: 'marcus', label: 'Marcus Lee' },
  { value: 'sara',   label: 'Sara Chen' },
  { value: 'diego',  label: 'Diego Vega' },
  { value: 'aisha',  label: 'Aisha Patel' },
];

export function MentionsBasic() {
  const [v, setV] = useState('Hey @');
  return (
    <Preview label="Type @ to mention someone" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <TkxMentions value={v} onChange={setV} options={PEOPLE} />
      </div>
      <p style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
        Try typing <code>@p</code> or <code>@d</code> to see the suggestion list.
      </p>
    </Preview>
  );
}

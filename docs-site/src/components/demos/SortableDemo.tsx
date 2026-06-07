import { useState } from 'react';
import { TkxSortable } from 'tekivex-ui';
import { Preview } from '../Preview';

interface Task { title: string; }

export function SortableBasic() {
  const [items, setItems] = useState([
    { id: '1', data: { title: 'Buy milk' } },
    { id: '2', data: { title: 'Walk the dog' } },
    { id: '3', data: { title: 'Reply to PR comments' } },
    { id: '4', data: { title: 'Renew domain registration' } },
    { id: '5', data: { title: 'Book dentist' } },
  ]);
  return (
    <Preview label="Drag to reorder">
      <div style={{ width: '100%', maxWidth: 480 }}>
        <TkxSortable<Task>
          items={items}
          onChange={setItems}
          renderItem={(item) => (
            <div style={{
              padding: '12px 16px',
              background: '#fafbfc',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              marginBottom: 6,
              cursor: 'grab',
              userSelect: 'none',
              fontSize: 13,
              color: '#1f2937',
            }}>
              ☰ {item.data.title}
            </div>
          )}
        />
      </div>
    </Preview>
  );
}

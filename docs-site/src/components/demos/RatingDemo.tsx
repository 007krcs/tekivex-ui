import { useState } from 'react';
import { TkxRating } from 'tekivex-ui';
import { Preview } from '../Preview';

export function RatingBasic() {
  const [v, setV] = useState(4);
  return (
    <Preview label="Basic — controlled 1-5" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxRating value={v} onChange={setV} />
      <p style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
        Rated: <strong>{v}</strong> / 5
      </p>
    </Preview>
  );
}

export function RatingHalfStars() {
  const [v, setV] = useState(3.5);
  return (
    <Preview label="Half-star precision" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxRating value={v} onChange={setV} precision={0.5} />
      <p style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
        Rated: <strong>{v}</strong> / 5
      </p>
    </Preview>
  );
}

export function RatingSizes() {
  return (
    <Preview label="Sizes" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
      <TkxRating defaultValue={4} size="sm" />
      <TkxRating defaultValue={4} size="md" />
      <TkxRating defaultValue={4} size="lg" />
    </Preview>
  );
}

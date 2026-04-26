import { TkxSkeleton, TkxCard, TkxCardBody } from 'tekivex-ui';
import { Preview } from '../Preview';

export function SkeletonShapes() {
  return (
    <Preview label="Shapes">
      <TkxSkeleton width={200} height={20} />
      <TkxSkeleton width={200} height={20} rounded />
      <TkxSkeleton variant="circle" width={48} />
      <div style={{ minWidth: 220 }}>
        <TkxSkeleton variant="text" count={3} />
      </div>
    </Preview>
  );
}

export function SkeletonCard() {
  return (
    <Preview label="Composed card skeleton">
      <div style={{ minWidth: 320 }}>
        <TkxCard>
          <TkxCardBody>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <TkxSkeleton variant="circle" width={48} />
              <div style={{ flex: 1 }}>
                <TkxSkeleton width="60%" height={16} />
                <TkxSkeleton width="40%" height={12} style={{ marginTop: 6 }} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <TkxSkeleton variant="text" count={3} />
            </div>
          </TkxCardBody>
        </TkxCard>
      </div>
    </Preview>
  );
}

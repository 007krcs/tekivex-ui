import { useState } from 'react';
import { TkxPagination } from 'tekivex-ui';
import { Preview } from '../Preview';

export function PaginationBasic() {
  const [page, setPage] = useState(1);
  return (
    <Preview style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <TkxPagination total={250} pageSize={10} page={page} onChange={setPage} />
    </Preview>
  );
}

export function PaginationCompact() {
  const [page, setPage] = useState(5);
  return (
    <Preview label="siblingCount={0} — compact" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <TkxPagination total={1000} pageSize={10} page={page} onChange={setPage} siblingCount={0} />
    </Preview>
  );
}

export function PaginationWithPageSize() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  return (
    <Preview label="With page-size selector" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <TkxPagination
        total={1000}
        pageSize={size}
        page={page}
        onChange={setPage}
        showPageSize
        pageSizeOptions={[10, 25, 50, 100]}
        onPageSizeChange={setSize}
      />
    </Preview>
  );
}

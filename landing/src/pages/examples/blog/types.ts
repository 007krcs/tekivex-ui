export type { Block, BlogPost, BlogConfig } from './store';

export type BlockKind =
  | 'paragraph'
  | 'heading2'
  | 'heading3'
  | 'image'
  | 'code'
  | 'quote'
  | 'list-ul'
  | 'list-ol'
  | 'video'
  | 'divider';

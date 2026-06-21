import { RpTagColor } from '../tag/rp-tag';

export type RpSortDir = 'asc' | 'desc';

export interface RpSort {
  key: string;
  dir: RpSortDir;
}

export interface RpColumnDef<T = Record<string, unknown>> {
  /** Property key on the row (also used for sort/filter). */
  key: string;
  /** Column header label (also used as the card-mode data label). */
  header: string;
  sortable?: boolean;
  /** Per-column filter control. */
  filter?: 'text' | 'select';
  /** Options when filter === 'select'. */
  filterOptions?: { label: string; value: string }[];
  align?: 'left' | 'right' | 'center';
  width?: string;
  /** Hide this column below the mobile breakpoint. */
  hideOnMobile?: boolean;
  /** Custom cell formatter. */
  cell?: (row: T) => string;
  /**
   * Cell rendering. 'badge' renders the value as a status pill (rp-tag with a
   * leading dot), coloured by `badgeTone` or a built-in status→tone map.
   */
  type?: 'text' | 'badge';
  /** Override the badge tone for a value (only used when type === 'badge'). */
  badgeTone?: (value: string, row: T) => RpTagColor;
}

/** Emitted on every interaction in server mode — feed this to your API call. */
export interface RpTableQuery {
  search: string;
  /** Multi-column sort, in priority order. */
  sort: RpSort[];
  filters: Record<string, string>;
  page: number;
  pageSize: number;
}

export type RpTableMode = 'client' | 'server';
export type RpTableDensity = 'comfortable' | 'compact';

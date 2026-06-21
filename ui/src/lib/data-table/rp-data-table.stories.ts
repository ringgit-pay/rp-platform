import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { RpDataTable } from './rp-data-table';
import { RpCellDef } from './rp-cell-def.directive';
import { RpRowDetailDef } from './rp-row-detail.directive';
import { RpColumnDef } from './rp-data-table.types';

interface Dda extends Record<string, unknown> {
  ref: string;
  customer: string;
  email: string;
  bank: string;
  frequency: string;
  status: string;
}

const columns: RpColumnDef<Dda>[] = [
  { key: 'ref', header: 'Reference', sortable: true },
  { key: 'customer', header: 'Customer', sortable: true },
  { key: 'bank', header: 'Bank', sortable: true },
  { key: 'frequency', header: 'Frequency' },
  // type: 'badge' renders a status pill (rp-tag) with a built-in status→tone map.
  { key: 'status', header: 'Status', type: 'badge', sortable: true },
];

const rows: Dda[] = [
  { ref: 'DDA-00142', customer: 'Ahmad bin Razali', email: 'ahmad@example.com', bank: 'Maybank Berhad', frequency: 'Monthly', status: 'Active' },
  { ref: 'DDA-00141', customer: 'Siti Nuraisha', email: 'siti@mail.com', bank: 'CIMB Bank', frequency: 'Monthly', status: 'Pending' },
  { ref: 'DDA-00139', customer: 'Raj Kumar', email: 'raj@business.my', bank: 'RHB Bank', frequency: 'Monthly', status: 'Active' },
  { ref: 'DDA-00136', customer: 'Lim Wei Kang', email: 'lim@corp.com', bank: 'Public Bank', frequency: 'Yearly', status: 'Terminated' },
  { ref: 'DDA-00130', customer: 'Nurul Huda', email: 'nurul@shop.my', bank: 'Bank Islam', frequency: 'Weekly', status: 'Inactive' },
];

/**
 * The recommended default presentation: a linked reference column and a
 * two-line identity cell (name + email), supplied as cell templates. The airy
 * spacing + status badge pill are the component's own defaults.
 */
const airyCells = `
  <ng-template rpCell="ref" let-value="value">
    <a href="#" style="color:var(--rp-brand);font-weight:var(--rp-font-weight-medium);text-decoration:none">{{ value }}</a>
  </ng-template>
  <ng-template rpCell="customer" let-row>
    <div style="color:var(--rp-text)">{{ row.customer }}</div>
    <div style="font-size:var(--rp-font-size-xs);color:var(--rp-text-subtle)">{{ row.email }}</div>
  </ng-template>
`;

const meta: Meta<RpDataTable<Dda>> = {
  title: 'Components/Data table',
  component: RpDataTable,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [RpDataTable, RpCellDef, RpRowDetailDef] })],
};
export default meta;

type Story = StoryObj<RpDataTable<Dda>>;

export const Default: Story = {
  render: () => ({
    props: { columns, rows, rowId: (r: Dda) => r.ref },
    template: `
      <rp-data-table [columns]="columns" [rows]="rows" [rowId]="rowId">
        ${airyCells}
      </rp-data-table>
    `,
  }),
};

export const Selectable: Story = {
  render: () => ({
    props: { columns, rows, rowId: (r: Dda) => r.ref },
    template: `
      <rp-data-table [columns]="columns" [rows]="rows" [rowId]="rowId" [selectable]="true">
        ${airyCells}
      </rp-data-table>
    `,
  }),
};

export const FullToolkit: Story = {
  render: () => ({
    props: { columns, rows, rowId: (r: Dda) => r.ref },
    template: `
      <rp-data-table [columns]="columns" [rows]="rows" [rowId]="rowId"
        [selectable]="true" [columnManager]="true" [exportable]="true">
        ${airyCells}
      </rp-data-table>
    `,
  }),
};

export const Dense: Story = {
  name: 'Dense (compact + striped)',
  render: () => ({
    props: { columns, rows, rowId: (r: Dda) => r.ref },
    template: `
      <rp-data-table [columns]="columns" [rows]="rows" [rowId]="rowId"
        density="compact" [striped]="true">
        ${airyCells}
      </rp-data-table>
    `,
  }),
};

// The component frames the projected rpRowDetail in an inset panel; the consumer
// supplies a label/value grid + actions (the recommended detail pattern).
const detailGrid = `
  <ng-template rpRowDetail let-row>
    <div style="display:flex;flex-wrap:wrap;align-items:flex-start;gap:14px 24px">
      <div><div style="font-size:var(--rp-font-size-xs);color:var(--rp-text-subtle)">Email</div><div>{{ row.email }}</div></div>
      <div><div style="font-size:var(--rp-font-size-xs);color:var(--rp-text-subtle)">Bank</div><div>{{ row.bank }}</div></div>
      <div><div style="font-size:var(--rp-font-size-xs);color:var(--rp-text-subtle)">Frequency</div><div>{{ row.frequency }}</div></div>
      <div><div style="font-size:var(--rp-font-size-xs);color:var(--rp-text-subtle)">Status</div><div>{{ row.status }}</div></div>
      <div style="margin-left:auto;display:flex;gap:8px">
        <a href="#" style="color:var(--rp-brand);font-weight:var(--rp-font-weight-medium);text-decoration:none">View mandate</a>
      </div>
    </div>
  </ng-template>
`;

export const Expandable: Story = {
  render: () => ({
    props: { columns, rows, rowId: (r: Dda) => r.ref },
    template: `
      <rp-data-table [columns]="columns" [rows]="rows" [rowId]="rowId" [expandable]="true">
        ${airyCells}
        ${detailGrid}
      </rp-data-table>
    `,
  }),
};

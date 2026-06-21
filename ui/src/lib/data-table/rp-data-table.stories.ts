import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { RpDataTable } from './rp-data-table';
import { RpCellDef } from './rp-cell-def.directive';
import { RpColumnDef } from './rp-data-table.types';

interface Batch extends Record<string, unknown> {
  id: number;
  batch: string;
  invoices: number;
  total: string;
  progress: string;
  status: string;
}

const columns: RpColumnDef<Batch>[] = [
  { key: 'batch', header: 'Batch', sortable: true },
  { key: 'invoices', header: 'Invoices', sortable: true, align: 'right' },
  { key: 'total', header: 'Total', sortable: true, align: 'right' },
  { key: 'progress', header: 'Progress', align: 'right' },
  // type: 'badge' renders a status pill (rp-tag) with a built-in status→tone map.
  { key: 'status', header: 'Status', type: 'badge', sortable: true },
];

const rows: Batch[] = [
  { id: 1, batch: 'Jan 2024', invoices: 12, total: 'RM 18,400.00', progress: '83%', status: 'Active' },
  { id: 2, batch: 'Feb 2024', invoices: 9, total: 'RM 12,600.00', progress: '100%', status: 'Closed' },
  { id: 3, batch: 'Mar 2024', invoices: 14, total: 'RM 31,500.00', progress: '60%', status: 'Overdue' },
  { id: 4, batch: 'Apr 2024', invoices: 13, total: 'RM 31,700.00', progress: '47%', status: 'Active' },
];

const meta: Meta<RpDataTable<Batch>> = {
  title: 'Components/Data table',
  component: RpDataTable,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [RpDataTable, RpCellDef] })],
  render: (args) => ({
    props: { ...args, columns, rows, rowId: (r: Batch) => r.id },
    template: `<rp-data-table
      [columns]="columns"
      [rows]="rows"
      [rowId]="rowId"
      [selectable]="selectable"
      [columnManager]="columnManager"
      [exportable]="exportable"
      [striped]="striped" />`,
  }),
};
export default meta;

type Story = StoryObj<RpDataTable<Batch>>;

export const Default: Story = { args: { striped: false } };
export const Selectable: Story = { args: { selectable: true, striped: true } };
export const FullToolkit: Story = {
  args: { selectable: true, columnManager: true, exportable: true, striped: true },
};

// ---- Airy direct-debit list: badge status column + two-line identity cell ----

interface Dda extends Record<string, unknown> {
  ref: string;
  customer: string;
  email: string;
  bank: string;
  frequency: string;
  status: string;
}

const ddaColumns: RpColumnDef<Dda>[] = [
  { key: 'ref', header: 'Reference', sortable: true },
  { key: 'customer', header: 'Customer', sortable: true },
  { key: 'bank', header: 'Bank', sortable: true },
  { key: 'frequency', header: 'Frequency' },
  { key: 'status', header: 'Status', type: 'badge', sortable: true },
];

const ddaRows: Dda[] = [
  { ref: 'DDA-00142', customer: 'Ahmad bin Razali', email: 'ahmad@example.com', bank: 'Maybank Berhad', frequency: 'Monthly', status: 'Active' },
  { ref: 'DDA-00141', customer: 'Siti Nuraisha', email: 'siti@mail.com', bank: 'CIMB Bank', frequency: 'Monthly', status: 'Pending' },
  { ref: 'DDA-00139', customer: 'Raj Kumar', email: 'raj@business.my', bank: 'RHB Bank', frequency: 'Monthly', status: 'Active' },
  { ref: 'DDA-00136', customer: 'Lim Wei Kang', email: 'lim@corp.com', bank: 'Public Bank', frequency: 'Yearly', status: 'Terminated' },
  { ref: 'DDA-00130', customer: 'Nurul Huda', email: 'nurul@shop.my', bank: 'Bank Islam', frequency: 'Weekly', status: 'Inactive' },
];

export const DirectDebitList: Story = {
  name: 'Airy (direct-debit list)',
  render: () => ({
    props: { ddaColumns, ddaRows, ddaId: (r: Dda) => r.ref },
    template: `
      <rp-data-table [columns]="ddaColumns" [rows]="ddaRows" [rowId]="ddaId" [selectable]="true" [exportable]="true">
        <ng-template rpCell="ref" let-value="value">
          <a href="#" style="color:var(--rp-brand);font-weight:var(--rp-font-weight-medium);text-decoration:none">{{ value }}</a>
        </ng-template>
        <ng-template rpCell="customer" let-row>
          <div style="color:var(--rp-text)">{{ row.customer }}</div>
          <div style="font-size:var(--rp-font-size-xs);color:var(--rp-text-subtle)">{{ row.email }}</div>
        </ng-template>
      </rp-data-table>
    `,
  }),
};

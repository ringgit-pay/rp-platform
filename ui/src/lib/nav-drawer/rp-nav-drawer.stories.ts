import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { RpNavDrawer } from './rp-nav-drawer';
import { RpButton } from '../button/rp-button';
import type { RpNavItem } from '../sidebar/rp-sidebar';

const navItems: RpNavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  {
    id: 'invoicing',
    label: 'Invoicing',
    icon: 'invoice',
    children: [
      { id: 'new-invoice', label: 'New invoice', icon: 'plus' },
      { id: 'invoice-batch', label: 'Invoice batch', icon: 'layers' },
      { id: 'invoice-list', label: 'Invoice list', icon: 'list' },
    ],
  },
  { id: 'payments', label: 'Payments', icon: 'bank' },
  { id: 'direct-debit', label: 'Direct debit', icon: 'mandate' },
  { id: 'reports', label: 'Reports', icon: 'chart' },
  { id: 'contacts', label: 'Contacts', icon: 'users' },
  { id: 'account', label: 'Account', icon: 'settings' },
];

const meta: Meta = {
  title: 'Components/Nav drawer',
  parameters: { layout: 'centered' },
  decorators: [moduleMetadata({ imports: [RpNavDrawer, RpButton] })],
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    props: { items: navItems, active: 'invoice-batch', open: true },
    template: `
      <div style="position:relative;width:380px;height:560px;overflow:hidden;
                  border:1px solid var(--rp-border);border-radius:20px;
                  display:flex;align-items:flex-start;justify-content:center;padding-top:24px;
                  background:var(--rp-surface-muted);font-family:var(--rp-font-family-sans)">
        <rp-button size="sm" (click)="open = true">Open menu</rp-button>
        <rp-nav-drawer [items]="items" [(open)]="open" [(active)]="active" logoText="RinggitPay" />
      </div>
    `,
  }),
};

import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { RpBottomNav } from './rp-bottom-nav';
import { RpNavDrawer } from '../nav-drawer/rp-nav-drawer';
import type { RpNavItem } from '../sidebar/rp-sidebar';

const navItems: RpNavItem[] = [
  { id: 'overview', label: 'Dashboard', icon: 'dashboard' },
  {
    id: 'invoicing',
    label: 'Invoices',
    icon: 'invoice',
    children: [
      { id: 'new-invoice', label: 'New invoice', icon: 'plus' },
      { id: 'invoice-batch', label: 'Invoice batch', icon: 'layers' },
      { id: 'invoice-list', label: 'Invoice list', icon: 'list' },
    ],
  },
  { id: 'payments', label: 'Payments', icon: 'bank' },
  { id: 'direct-debit', label: 'Debit', icon: 'mandate' },
  { id: 'reports', label: 'Reports', icon: 'chart' },
  { id: 'contacts', label: 'Contacts', icon: 'users' },
  { id: 'account', label: 'Account', icon: 'settings' },
];

const meta: Meta = {
  title: 'Components/Bottom nav',
  parameters: { layout: 'centered' },
  decorators: [moduleMetadata({ imports: [RpBottomNav, RpNavDrawer] })],
};
export default meta;

type Story = StoryObj;

export const WithDrawer: Story = {
  name: 'Bottom nav + More drawer',
  render: () => ({
    props: { items: navItems, active: 'overview', drawerOpen: false },
    template: `
      <div style="position:relative;width:380px;height:560px;overflow:hidden;
                  border:1px solid var(--rp-border);border-radius:20px;
                  display:flex;flex-direction:column;background:var(--rp-surface-muted);
                  font-family:var(--rp-font-family-sans)">
        <div style="flex:1;display:flex;align-items:center;justify-content:center;
                    padding:20px;color:var(--rp-text-muted);font-size:13px;text-align:center;min-height:0">
          Active: {{ active }}<br/>Tap "More" to open the left menu
        </div>
        <rp-bottom-nav [items]="items" [(active)]="active" (moreClick)="drawerOpen = true" />
        <rp-nav-drawer [items]="items" [(open)]="drawerOpen" [(active)]="active" logoText="RinggitPay" />
      </div>
    `,
  }),
};

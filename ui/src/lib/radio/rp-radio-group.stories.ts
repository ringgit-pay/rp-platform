import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { RpRadioGroup, RpRadio } from './rp-radio-group';

const meta: Meta = {
  title: 'Forms/Radio group',
  decorators: [moduleMetadata({ imports: [RpRadioGroup, RpRadio] })],
};
export default meta;

type Story = StoryObj;

export const Horizontal: Story = {
  render: () => ({
    props: { currency: 'MYR' },
    template: `
      <rp-radio-group [(value)]="currency">
        <rp-radio value="MYR">MYR</rp-radio>
        <rp-radio value="USD">USD</rp-radio>
        <rp-radio value="SGD">SGD</rp-radio>
      </rp-radio-group>
      <p style="margin-top:14px;font-family:var(--rp-font-family-sans);color:var(--rp-text-muted)">
        Selected: {{ currency }}
      </p>
    `,
  }),
};

export const Vertical: Story = {
  render: () => ({
    props: { plan: 'monthly' },
    template: `
      <rp-radio-group [(value)]="plan" orientation="vertical">
        <rp-radio value="monthly">Monthly billing</rp-radio>
        <rp-radio value="yearly">Yearly billing</rp-radio>
        <rp-radio value="oneoff" [disabled]="true">One-off (disabled)</rp-radio>
      </rp-radio-group>
    `,
  }),
};

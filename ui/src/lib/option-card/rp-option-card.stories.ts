import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { RpOptionCardGroup, RpOptionCard } from './rp-option-card';

const meta: Meta = {
  title: 'Forms/Option cards',
  decorators: [moduleMetadata({ imports: [RpOptionCardGroup, RpOptionCard] })],
};
export default meta;

type Story = StoryObj;

export const SendVia: Story = {
  render: () => ({
    props: { channel: 'email' },
    template: `
      <div style="max-width:380px">
        <rp-option-card-group [(value)]="channel">
          <rp-option-card value="email" icon="mail" label="Email" />
          <rp-option-card value="sms" icon="message" label="SMS" />
          <rp-option-card value="whatsapp" icon="phone" label="WhatsApp" />
        </rp-option-card-group>
        <p style="margin-top:14px;font-family:var(--rp-font-family-sans);color:var(--rp-text-muted)">
          Selected: {{ channel }}
        </p>
      </div>
    `,
  }),
};

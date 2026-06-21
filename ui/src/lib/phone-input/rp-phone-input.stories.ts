import type { Meta, StoryObj } from '@storybook/angular';
import { RpPhoneInput } from './rp-phone-input';

const meta: Meta<RpPhoneInput> = {
  title: 'Forms/Phone input',
  component: RpPhoneInput,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<div style="width:280px"><rp-phone-input [country]="country" /></div>`,
  }),
};
export default meta;

type Story = StoryObj<RpPhoneInput>;

export const Default: Story = { args: { country: 'MY' } };

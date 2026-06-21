import type { Meta, StoryObj } from '@storybook/angular';
import { RpMoneyInput } from './rp-money-input';

const meta: Meta<RpMoneyInput> = {
  title: 'Forms/Money input',
  component: RpMoneyInput,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<div style="width:240px"><rp-money-input [symbol]="symbol" [currency]="currency" /></div>`,
  }),
};
export default meta;

type Story = StoryObj<RpMoneyInput>;

export const Default: Story = { args: { symbol: 'RM', currency: 'MYR' } };
export const USD: Story = { args: { symbol: '$', currency: 'USD' } };

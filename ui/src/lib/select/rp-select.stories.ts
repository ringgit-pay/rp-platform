import type { Meta, StoryObj } from '@storybook/angular';
import { RpSelect } from './rp-select';

const meta: Meta<RpSelect> = {
  title: 'Forms/Select',
  component: RpSelect,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<div style="width:260px"><rp-select [options]="options" [placeholder]="placeholder" [clearable]="clearable" /></div>`,
  }),
};
export default meta;

type Story = StoryObj<RpSelect>;

export const Currency: Story = {
  args: {
    placeholder: 'Select currency',
    clearable: true,
    options: [
      { label: 'MYR — Malaysian Ringgit', value: 'MYR' },
      { label: 'USD — US Dollar', value: 'USD' },
      { label: 'SGD — Singapore Dollar', value: 'SGD' },
      { label: 'EUR — Euro', value: 'EUR', disabled: true },
    ],
  },
};

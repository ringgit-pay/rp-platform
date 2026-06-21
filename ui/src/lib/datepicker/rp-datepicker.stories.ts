import type { Meta, StoryObj } from '@storybook/angular';
import { RpDatepicker } from './rp-datepicker';

const meta: Meta<RpDatepicker> = {
  title: 'Forms/Datepicker',
  component: RpDatepicker,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<div style="width:240px"><rp-datepicker [placeholder]="placeholder" /></div>`,
  }),
};
export default meta;

type Story = StoryObj<RpDatepicker>;

export const Default: Story = { args: { placeholder: 'Select date' } };

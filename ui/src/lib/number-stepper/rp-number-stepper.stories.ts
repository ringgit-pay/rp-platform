import type { Meta, StoryObj } from '@storybook/angular';
import { RpNumberStepper } from './rp-number-stepper';

const meta: Meta<RpNumberStepper> = {
  title: 'Forms/Number stepper',
  component: RpNumberStepper,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<rp-number-stepper [min]="min" [max]="max" [stepBy]="stepBy" />`,
  }),
};
export default meta;

type Story = StoryObj<RpNumberStepper>;

export const Default: Story = { args: { min: 1, max: 99, stepBy: 1 } };

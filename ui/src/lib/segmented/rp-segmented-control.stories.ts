import type { Meta, StoryObj } from '@storybook/angular';
import { RpSegmentedControl } from './rp-segmented-control';

const meta: Meta<RpSegmentedControl> = {
  title: 'Forms/Segmented control',
  component: RpSegmentedControl,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<rp-segmented-control [segments]="segments" [value]="value" [size]="size" />`,
  }),
};
export default meta;

type Story = StoryObj<RpSegmentedControl>;

export const Schedule: Story = {
  args: {
    value: 'one-time',
    segments: [
      { label: 'One-time', value: 'one-time' },
      { label: 'Recurring', value: 'recurring' },
    ],
  },
};

export const SimpleAdvanced: Story = {
  args: {
    value: 'simple',
    size: 'sm',
    segments: [
      { label: 'Simple', value: 'simple' },
      { label: 'Advanced', value: 'advanced' },
    ],
  },
};

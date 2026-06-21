import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { RpCard } from '../card/rp-card';
import { RpButton } from '../button/rp-button';
import { RpFormField } from '../form-field/rp-form-field';
import { RpInput } from '../input/rp-input';
import { RpTextarea } from '../textarea/rp-textarea';
import { RpCheckbox } from '../checkbox/rp-checkbox';
import { RpSwitch } from '../switch/rp-switch';
import { RpIcon } from '../icon/rp-icon';
import { RpMoneyInput } from '../money-input/rp-money-input';
import { RpNumberStepper } from '../number-stepper/rp-number-stepper';
import { RpRadioGroup, RpRadio } from '../radio/rp-radio-group';
import { RpSegmentedControl } from '../segmented/rp-segmented-control';
import { RpOptionCardGroup, RpOptionCard } from '../option-card/rp-option-card';
import { RpPhoneInput } from '../phone-input/rp-phone-input';
import { RpSelect } from '../select/rp-select';
import { RpDatepicker } from '../datepicker/rp-datepicker';

const meta: Meta = {
  title: 'Gallery/New invoice',
  parameters: { layout: 'fullscreen' },
  decorators: [
    moduleMetadata({
      imports: [
        FormsModule,
        RpCard,
        RpButton,
        RpFormField,
        RpInput,
        RpTextarea,
        RpCheckbox,
        RpSwitch,
        RpIcon,
        RpMoneyInput,
        RpNumberStepper,
        RpRadioGroup,
        RpRadio,
        RpSegmentedControl,
        RpOptionCardGroup,
        RpOptionCard,
        RpPhoneInput,
        RpSelect,
        RpDatepicker,
      ],
    }),
  ],
};
export default meta;

type Story = StoryObj;

export const NewInvoice: Story = {
  render: () => ({
    props: {
      mode: 'simple',
      schedule: 'one-time',
      channel: 'email',
      currency: 'MYR',
      qty: 1,
      template: false,
      partial: false,
      scheduleSegs: [
        { label: 'One-time', value: 'one-time' },
        { label: 'Recurring', value: 'recurring' },
      ],
      modeSegs: [
        { label: 'Simple', value: 'simple' },
        { label: 'Advanced', value: 'advanced' },
      ],
      currencyOpts: [
        { label: 'MYR', value: 'MYR' },
        { label: 'USD', value: 'USD' },
        { label: 'SGD', value: 'SGD' },
      ],
    },
    template: `
      <div style="background:var(--rp-surface-muted);min-height:100vh;padding:24px;font-family:var(--rp-font-family-sans)">
        <div style="max-width:1180px;margin:0 auto">

          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px">
            <div>
              <h1 style="margin:0;font-size:var(--rp-font-size-2xl);font-weight:600;color:var(--rp-text)">New invoice</h1>
              <p style="margin:4px 0 0;color:var(--rp-text-muted)">Fill in the details and configure delivery settings</p>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <span style="color:var(--rp-text-muted);font-size:var(--rp-font-size-sm)">{{ mode === 'simple' ? 'Simple' : 'Advanced' }}</span>
              <rp-segmented-control [segments]="modeSegs" [(value)]="mode" size="sm" />
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 320px;gap:20px;align-items:start">

            <!-- LEFT column -->
            <div style="display:flex;flex-direction:column;gap:16px">

              <rp-card heading="Payer (bill to)">
                <div card-actions>
                  <rp-button variant="secondary" size="sm"><rp-icon name="users" [size]="16" /> Import contact</rp-button>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                  <rp-form-field label="Payer name" [required]="true">
                    <rp-input placeholder="Full name" />
                  </rp-form-field>
                  <rp-form-field label="Email" [required]="true">
                    <rp-input type="email" placeholder="payer@email.com">
                      <rp-icon rp-prefix name="mail" [size]="16" />
                    </rp-input>
                  </rp-form-field>
                  <rp-form-field label="Phone">
                    <rp-phone-input country="MY" />
                  </rp-form-field>
                  <rp-form-field label="Address">
                    <rp-input placeholder="Street address" />
                  </rp-form-field>
                </div>
              </rp-card>

              <rp-card heading="Invoice details">
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">
                  <rp-form-field label="Invoice number" [required]="true">
                    <rp-input placeholder="INV-2024001" />
                  </rp-form-field>
                  <rp-form-field label="Issued date" [required]="true">
                    <rp-datepicker placeholder="Select date" />
                  </rp-form-field>
                  <rp-form-field label="Due date" [required]="true">
                    <rp-datepicker placeholder="Select date" />
                  </rp-form-field>
                  <rp-form-field label="Reference (note 1)">
                    <rp-input placeholder="e.g. PO-001" />
                  </rp-form-field>
                  <rp-form-field label="Note 2">
                    <rp-input placeholder="Additional reference" />
                  </rp-form-field>
                  <rp-form-field label="Currency">
                    <rp-select [options]="currencyOpts" [(value)]="currency" />
                  </rp-form-field>
                </div>
              </rp-card>

              <rp-card heading="Line items">
                <div style="display:grid;grid-template-columns:1.4fr 1.6fr 1fr 0.8fr 0.9fr auto;gap:10px;align-items:end">
                  <rp-form-field label="Item name" [required]="true"><rp-input placeholder="Item name" /></rp-form-field>
                  <rp-form-field label="Description"><rp-input placeholder="Description" /></rp-form-field>
                  <rp-form-field label="Unit price" [required]="true"><rp-money-input /></rp-form-field>
                  <rp-form-field label="Qty" [required]="true"><rp-number-stepper [(ngModel)]="qty" [min]="1" /></rp-form-field>
                  <rp-form-field label="Tax (MYR)"><rp-money-input /></rp-form-field>
                  <div style="padding-bottom:10px;color:var(--rp-text-muted)"><rp-icon name="trash" [size]="18" /></div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:14px;border-top:1px solid var(--rp-border)">
                  <rp-button variant="ghost" size="sm"><rp-icon name="plus" [size]="16" /> Add item</rp-button>
                  <div style="display:flex;align-items:center;gap:12px">
                    <span style="color:var(--rp-text-muted)">Invoice total</span>
                    <span class="rp-tabular" style="font-size:var(--rp-font-size-xl);font-weight:600;color:var(--rp-text)">MYR 0.00</span>
                  </div>
                </div>
              </rp-card>

              <rp-card heading="More options">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
                  <div>
                    <rp-checkbox [(ngModel)]="partial">Allow partial payment</rp-checkbox>
                  </div>
                  <rp-form-field label="Bill note">
                    <rp-textarea placeholder="Optional note printed on the invoice…" />
                  </rp-form-field>
                </div>
              </rp-card>

            </div>

            <!-- RIGHT column -->
            <div style="display:flex;flex-direction:column;gap:16px">

              <rp-card heading="Send via">
                <rp-option-card-group [(value)]="channel">
                  <rp-option-card value="email" icon="mail" label="Email" />
                  <rp-option-card value="sms" icon="message" label="SMS" />
                  <rp-option-card value="whatsapp" icon="phone" label="WhatsApp" />
                </rp-option-card-group>
              </rp-card>

              <rp-card heading="Schedule">
                <rp-segmented-control [segments]="scheduleSegs" [(value)]="schedule" />
              </rp-card>

              <rp-card heading="Template">
                <div style="display:flex;align-items:center;justify-content:space-between">
                  <span style="color:var(--rp-text)">Save as template</span>
                  <rp-switch [(ngModel)]="template" />
                </div>
              </rp-card>

              <div style="display:flex;flex-direction:column;gap:10px">
                <rp-button variant="secondary" [full]="true">Cancel</rp-button>
                <rp-button variant="secondary" [full]="true"><rp-icon name="download" [size]="16" /> Save draft</rp-button>
                <rp-button [full]="true"><rp-icon name="link" [size]="16" /> Publish &amp; send</rp-button>
              </div>

            </div>

          </div>
        </div>
      </div>
    `,
  }),
};

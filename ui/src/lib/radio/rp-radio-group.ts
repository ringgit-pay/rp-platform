import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
  input,
  model,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Radio group + radio. The group owns the selected value (ControlValueAccessor),
 * children read/set it via DI. Usage:
 *   <rp-radio-group [(value)]="currency">
 *     <rp-radio value="MYR">MYR</rp-radio>
 *     <rp-radio value="USD">USD</rp-radio>
 *   </rp-radio-group>
 */
@Component({
  selector: 'rp-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RpRadioGroup),
      multi: true,
    },
  ],
  host: {
    role: 'radiogroup',
    '[class.rp-radio-group--vertical]': "orientation() === 'vertical'",
  },
  template: `<ng-content />`,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 16px;
      }
      :host(.rp-radio-group--vertical) {
        flex-direction: column;
        gap: 10px;
      }
    `,
  ],
})
export class RpRadioGroup implements ControlValueAccessor {
  readonly value = model<unknown>(null);
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly disabled = model<boolean>(false);

  private onChange: (value: unknown) => void = () => undefined;
  onTouched: () => void = () => undefined;

  writeValue(value: unknown): void {
    this.value.set(value);
  }
  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  select(value: unknown): void {
    if (this.disabled()) return;
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }

  isSelected(value: unknown): boolean {
    return this.value() === value;
  }
}

@Component({
  selector: 'rp-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.rp-radio--disabled]': 'disabled() || group.disabled()',
  },
  template: `
    <label class="rp-radio">
      <span
        class="rp-radio__dot"
        [class.rp-radio__dot--checked]="group.isSelected(value())"
      ></span>
      <input
        type="radio"
        class="rp-radio__native"
        [checked]="group.isSelected(value())"
        [disabled]="disabled() || group.disabled()"
        (change)="group.select(value())"
        (blur)="group.onTouched()"
      />
      <span class="rp-radio__label"><ng-content /></span>
    </label>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      :host(.rp-radio--disabled) {
        opacity: 0.6;
        pointer-events: none;
      }
      .rp-radio {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-family: var(--rp-font-family-sans);
        font-size: var(--rp-font-size-base);
        color: var(--rp-text);
        user-select: none;
      }
      .rp-radio__native {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
      }
      .rp-radio__dot {
        position: relative;
        display: inline-flex;
        width: 18px;
        height: 18px;
        border: 1px solid var(--rp-border-strong);
        border-radius: 50%;
        background: var(--rp-surface);
        transition: border-color 0.12s ease;
      }
      .rp-radio__dot--checked {
        border-color: var(--rp-brand);
        border-width: 2px;
      }
      .rp-radio__dot--checked::after {
        content: '';
        position: absolute;
        inset: 3px;
        border-radius: 50%;
        background: var(--rp-brand);
      }
      .rp-radio__native:focus-visible + .rp-radio__dot {
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--rp-brand) 25%, transparent);
      }
    `,
  ],
})
export class RpRadio {
  readonly value = input<unknown>(null);
  readonly disabled = input<boolean>(false);
  readonly group = inject(RpRadioGroup);
}

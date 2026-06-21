import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
  input,
  model,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RpIcon } from '../icon/rp-icon';

/**
 * Selectable option cards (tiles), single-select. For choices like
 * "Send via: Email / SMS / WhatsApp". Group owns value (CVA); cards via DI.
 *   <rp-option-card-group [(value)]="channel">
 *     <rp-option-card value="email" icon="mail" label="Email" />
 *   </rp-option-card-group>
 */
@Component({
  selector: 'rp-option-card-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RpOptionCardGroup),
      multi: true,
    },
  ],
  host: { role: 'radiogroup' },
  template: `<ng-content />`,
  styles: [
    `
      :host {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
        gap: 10px;
      }
    `,
  ],
})
export class RpOptionCardGroup implements ControlValueAccessor {
  readonly value = model<unknown>(null);
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
  selector: 'rp-option-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RpIcon],
  template: `
    <button
      type="button"
      class="rp-optcard"
      role="radio"
      [class.rp-optcard--active]="group.isSelected(value())"
      [attr.aria-checked]="group.isSelected(value())"
      [disabled]="disabled() || group.disabled()"
      (click)="group.select(value())"
    >
      @if (icon()) {
        <span class="rp-optcard__icon"><rp-icon [name]="icon()" [size]="20" /></span>
      }
      <span class="rp-optcard__label">{{ label() }}</span>
      @if (desc()) {
        <span class="rp-optcard__desc">{{ desc() }}</span>
      }
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .rp-optcard {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        width: 100%;
        padding: 14px 10px;
        background: var(--rp-surface);
        border: 1px solid var(--rp-border-strong);
        border-radius: var(--rp-radius-md);
        cursor: pointer;
        font-family: var(--rp-font-family-sans);
        color: var(--rp-text-muted);
        transition: border-color 0.14s ease, background-color 0.14s ease,
          color 0.14s ease;
      }
      .rp-optcard:hover:not(:disabled) {
        border-color: var(--rp-brand);
      }
      .rp-optcard:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .rp-optcard--active {
        border-color: var(--rp-brand);
        background: var(--rp-color-brand-50);
        color: var(--rp-color-brand-700);
      }
      .rp-optcard__icon {
        display: inline-flex;
        color: inherit;
      }
      .rp-optcard__label {
        font-size: var(--rp-font-size-sm);
        font-weight: var(--rp-font-weight-medium);
        color: var(--rp-text);
      }
      .rp-optcard--active .rp-optcard__label {
        color: var(--rp-color-brand-700);
      }
      .rp-optcard__desc {
        font-size: var(--rp-font-size-xs);
        color: var(--rp-text-muted);
        text-align: center;
      }
    `,
  ],
})
export class RpOptionCard {
  readonly value = input<unknown>(null);
  readonly icon = input<string>('');
  readonly label = input<string>('');
  readonly desc = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly group = inject(RpOptionCardGroup);
}

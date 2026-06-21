import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RpIcon } from '../icon/rp-icon';

export interface RpSegment {
  label: string;
  value: string;
  icon?: string;
}

/**
 * Segmented control — a connected row of pill options, single-select.
 * For toggles like One-time / Recurring or Simple / Advanced.
 */
@Component({
  selector: 'rp-segmented-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RpIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RpSegmentedControl),
      multi: true,
    },
  ],
  host: { role: 'tablist' },
  template: `
    <div class="rp-seg" [class.rp-seg--sm]="size() === 'sm'" [class.rp-seg--disabled]="disabled()">
      @for (seg of segments(); track seg.value) {
        <button
          type="button"
          role="tab"
          class="rp-seg__item"
          [class.rp-seg__item--active]="value() === seg.value"
          [attr.aria-selected]="value() === seg.value"
          [disabled]="disabled()"
          (click)="select(seg.value)"
        >
          @if (seg.icon) {
            <rp-icon [name]="seg.icon" [size]="16" />
          }
          {{ seg.label }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
      .rp-seg {
        display: inline-flex;
        gap: 2px;
        padding: 3px;
        background: var(--rp-surface-sunken);
        border-radius: var(--rp-radius-md);
      }
      .rp-seg--disabled {
        opacity: 0.6;
        pointer-events: none;
      }
      .rp-seg__item {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 7px 16px;
        border: 0;
        border-radius: calc(var(--rp-radius-md) - 2px);
        background: transparent;
        color: var(--rp-text-muted);
        font-family: var(--rp-font-family-sans);
        font-size: var(--rp-font-size-sm);
        font-weight: var(--rp-font-weight-medium);
        cursor: pointer;
        transition: background-color 0.15s ease, color 0.15s ease;
      }
      .rp-seg--sm .rp-seg__item {
        padding: 5px 12px;
        font-size: var(--rp-font-size-xs);
      }
      .rp-seg__item:hover:not(.rp-seg__item--active) {
        color: var(--rp-text);
      }
      .rp-seg__item--active {
        background: var(--rp-brand);
        color: var(--rp-text-on-brand);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
      }
    `,
  ],
})
export class RpSegmentedControl implements ControlValueAccessor {
  readonly segments = input<RpSegment[]>([]);
  readonly size = input<'md' | 'sm'>('md');
  readonly value = model<string>('');

  protected readonly disabled = signal(false);

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected select(value: string): void {
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }
}

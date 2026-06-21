import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RpIcon } from '../icon/rp-icon';

/** Numeric stepper: − [ n ] + with min/max/step clamping. Model is a number. */
@Component({
  selector: 'rp-number-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RpIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RpNumberStepper),
      multi: true,
    },
  ],
  template: `
    <div class="rp-stepper" [class.rp-stepper--disabled]="disabled()">
      <button
        type="button"
        class="rp-stepper__btn"
        aria-label="Decrease"
        [disabled]="disabled() || value() <= min()"
        (click)="step(-1)"
      >
        <rp-icon name="minus" [size]="16" />
      </button>
      <input
        class="rp-stepper__field rp-tabular"
        type="text"
        inputmode="numeric"
        [disabled]="disabled()"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="onBlur()"
      />
      <button
        type="button"
        class="rp-stepper__btn"
        aria-label="Increase"
        [disabled]="disabled() || value() >= max()"
        (click)="step(1)"
      >
        <rp-icon name="plus" [size]="16" />
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
      .rp-stepper {
        display: inline-flex;
        align-items: center;
        height: 40px;
        background: var(--rp-surface);
        border: 1px solid var(--rp-border-strong);
        border-radius: var(--rp-radius-md);
        overflow: hidden;
      }
      .rp-stepper:focus-within {
        border-color: var(--rp-brand);
        box-shadow: 0 0 0 3px
          color-mix(in srgb, var(--rp-brand) 18%, transparent);
      }
      .rp-stepper--disabled {
        background: var(--rp-surface-sunken);
        opacity: 0.7;
      }
      .rp-stepper__btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 100%;
        border: 0;
        background: transparent;
        color: var(--rp-text-muted);
        cursor: pointer;
        transition: background-color 0.12s ease, color 0.12s ease;
      }
      .rp-stepper__btn:hover:not(:disabled) {
        background: var(--rp-surface-sunken);
        color: var(--rp-text);
      }
      .rp-stepper__btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .rp-stepper__field {
        width: 44px;
        height: 100%;
        border: 0;
        border-left: 1px solid var(--rp-border);
        border-right: 1px solid var(--rp-border);
        outline: 0;
        background: transparent;
        text-align: center;
        font-family: var(--rp-font-family-sans);
        font-size: var(--rp-font-size-base);
        color: var(--rp-text);
      }
    `,
  ],
})
export class RpNumberStepper implements ControlValueAccessor {
  readonly min = input<number>(0);
  readonly max = input<number>(Number.MAX_SAFE_INTEGER);
  readonly stepBy = input<number>(1);

  protected readonly value = signal<number>(0);
  protected readonly disabled = signal(false);

  private onChange: (value: number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: number): void {
    this.value.set(this.clamp(Number(value) || 0));
  }
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected step(direction: number): void {
    this.commit(this.value() + direction * this.stepBy());
  }

  protected onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.replace(/[^0-9-]/g, '');
    const num = raw === '' || raw === '-' ? this.min() : Number(raw);
    this.value.set(num);
    this.onChange(num);
  }

  protected onBlur(): void {
    this.commit(this.value());
    this.onTouched();
  }

  private commit(next: number): void {
    const clamped = this.clamp(next);
    this.value.set(clamped);
    this.onChange(clamped);
  }

  private clamp(n: number): number {
    return Math.min(this.max(), Math.max(this.min(), n));
  }
}

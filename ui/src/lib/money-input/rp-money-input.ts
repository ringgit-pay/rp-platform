import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { formatNumber } from '@rp/util';

/**
 * Money amount input. Shows a currency prefix (e.g. "RM") and formats the
 * entered number with locale grouping + fixed decimals on blur. The model
 * value is always a plain `number` in major units (e.g. 1234.5), or null.
 */
@Component({
  selector: 'rp-money-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RpMoneyInput),
      multi: true,
    },
  ],
  template: `
    <div
      class="rp-money"
      [class.rp-money--invalid]="invalid()"
      [class.rp-money--disabled]="disabled()"
    >
      <span class="rp-money__prefix">{{ symbol() }}</span>
      <input
        class="rp-money__field rp-tabular"
        type="text"
        inputmode="decimal"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [value]="display()"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
      />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .rp-money {
        display: flex;
        align-items: center;
        min-height: 40px;
        padding: 0 12px;
        background: var(--rp-surface);
        border: 1px solid var(--rp-border-strong);
        border-radius: var(--rp-radius-md);
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .rp-money:focus-within {
        border-color: var(--rp-brand);
        box-shadow: 0 0 0 3px
          color-mix(in srgb, var(--rp-brand) 18%, transparent);
      }
      .rp-money--invalid {
        border-color: var(--rp-danger);
      }
      .rp-money--disabled {
        background: var(--rp-surface-sunken);
        opacity: 0.7;
      }
      .rp-money__prefix {
        font-family: var(--rp-font-family-sans);
        font-size: var(--rp-font-size-base);
        color: var(--rp-text-muted);
        margin-right: 8px;
        flex-shrink: 0;
      }
      .rp-money__field {
        flex: 1;
        min-width: 0;
        border: 0;
        outline: 0;
        background: transparent;
        text-align: right;
        font-family: var(--rp-font-family-sans);
        font-size: var(--rp-font-size-base);
        color: var(--rp-text);
      }
      .rp-money__field::placeholder {
        color: var(--rp-text-subtle);
      }
    `,
  ],
})
export class RpMoneyInput implements ControlValueAccessor {
  readonly currency = input<string>('MYR');
  readonly locale = input<string>('en-MY');
  readonly symbol = input<string>('RM');
  readonly fractionDigits = input<number>(2);
  readonly placeholder = input<string>('0.00');
  readonly invalid = input<boolean>(false);

  /** Raw text while focused; formatted text while blurred. */
  protected readonly display = signal('');
  protected readonly disabled = signal(false);
  private readonly focused = signal(false);
  private value: number | null = null;

  protected readonly formatted = computed(() => this.display());

  private onChange: (value: number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: number | null): void {
    this.value = value == null || value === ('' as unknown) ? null : Number(value);
    this.display.set(this.focused() ? this.rawString() : this.formatValue());
  }
  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    // Keep only digits, one dot, optional leading minus
    const cleaned = raw
      .replace(/[^0-9.-]/g, '')
      .replace(/(?!^)-/g, '')
      .replace(/(\..*)\./g, '$1');
    this.display.set(cleaned);
    const num = cleaned === '' || cleaned === '-' ? null : Number(cleaned);
    this.value = num != null && Number.isFinite(num) ? num : null;
    this.onChange(this.value);
  }

  protected onFocus(): void {
    this.focused.set(true);
    this.display.set(this.rawString());
  }

  protected onBlur(): void {
    this.focused.set(false);
    this.display.set(this.formatValue());
    this.onTouched();
  }

  private rawString(): string {
    return this.value == null ? '' : String(this.value);
  }

  private formatValue(): string {
    if (this.value == null || !Number.isFinite(this.value)) return '';
    // Delegate number formatting to the shared @rp/util helper (single source of
    // truth); the currency symbol is rendered separately as the field prefix.
    return formatNumber(this.value, {
      locale: this.locale(),
      minimumFractionDigits: this.fractionDigits(),
      maximumFractionDigits: this.fractionDigits(),
    });
  }
}

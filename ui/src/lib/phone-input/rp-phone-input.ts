import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RP_COUNTRIES, RP_DEFAULT_COUNTRY, RpCountry } from './countries';

/**
 * Phone input: country dial-code selector + national number. The form value
 * (ControlValueAccessor) is an E.164-style string, e.g. "+60123456789".
 * The selected country ISO is also exposed as a two-way `country` model.
 */
@Component({
  selector: 'rp-phone-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RpPhoneInput),
      multi: true,
    },
  ],
  template: `
    <div
      class="rp-phone"
      [class.rp-phone--invalid]="invalid()"
      [class.rp-phone--disabled]="disabled()"
    >
      <div class="rp-phone__cc">
        <select
          class="rp-phone__cc-select"
          aria-label="Country code"
          [disabled]="disabled()"
          [value]="country()"
          (change)="onCountry($event)"
        >
          @for (c of countries(); track c.iso) {
            <option [value]="c.iso">{{ c.iso }} {{ c.dial }}</option>
          }
        </select>
        <span class="rp-phone__cc-text" aria-hidden="true">
          {{ selected().iso }} {{ selected().dial }}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round"
               stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </span>
      </div>
      <input
        class="rp-phone__num"
        type="tel"
        inputmode="tel"
        autocomplete="tel-national"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [value]="national()"
        (input)="onNumber($event)"
        (blur)="onBlur()"
      />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .rp-phone {
        display: flex;
        align-items: stretch;
        min-height: 40px;
        background: var(--rp-surface);
        border: 1px solid var(--rp-border-strong);
        border-radius: var(--rp-radius-md);
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .rp-phone:focus-within {
        border-color: var(--rp-brand);
        box-shadow: 0 0 0 3px
          color-mix(in srgb, var(--rp-brand) 18%, transparent);
      }
      .rp-phone--invalid {
        border-color: var(--rp-danger);
      }
      .rp-phone--disabled {
        background: var(--rp-surface-sunken);
        opacity: 0.7;
      }
      .rp-phone__cc {
        position: relative;
        display: inline-flex;
        align-items: center;
        border-right: 1px solid var(--rp-border);
      }
      .rp-phone__cc-select {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        border: 0;
      }
      .rp-phone__cc-text {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 0 10px 0 12px;
        font-family: var(--rp-font-family-sans);
        font-size: var(--rp-font-size-sm);
        color: var(--rp-text);
        white-space: nowrap;
        pointer-events: none;
      }
      .rp-phone__cc-text svg {
        color: var(--rp-text-muted);
      }
      .rp-phone__num {
        flex: 1;
        min-width: 0;
        border: 0;
        outline: 0;
        background: transparent;
        padding: 0 12px;
        font-family: var(--rp-font-family-sans);
        font-size: var(--rp-font-size-base);
        color: var(--rp-text);
      }
      .rp-phone__num::placeholder {
        color: var(--rp-text-subtle);
      }
    `,
  ],
})
export class RpPhoneInput implements ControlValueAccessor {
  readonly countries = input<RpCountry[]>(RP_COUNTRIES);
  readonly placeholder = input<string>('12-345 6789');
  readonly invalid = input<boolean>(false);
  readonly country = model<string>(RP_DEFAULT_COUNTRY);

  protected readonly national = signal('');
  protected readonly disabled = signal(false);

  protected readonly selected = computed<RpCountry>(() => {
    const iso = this.country();
    return (
      this.countries().find((c) => c.iso === iso) ??
      this.countries()[0] ?? { iso: 'MY', name: 'Malaysia', dial: '+60' }
    );
  });

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string): void {
    const str = (value ?? '').trim();
    if (!str) {
      this.national.set('');
      return;
    }
    // Try to match a known dial code to split country + national part
    const match = [...this.countries()]
      .sort((a, b) => b.dial.length - a.dial.length)
      .find((c) => str.startsWith(c.dial));
    if (match) {
      this.country.set(match.iso);
      this.national.set(str.slice(match.dial.length).replace(/^\s+/, ''));
    } else {
      this.national.set(str.replace(/^\+/, ''));
    }
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

  protected onCountry(event: Event): void {
    this.country.set((event.target as HTMLSelectElement).value);
    this.emit();
  }

  protected onNumber(event: Event): void {
    const cleaned = (event.target as HTMLInputElement).value.replace(/[^\d\s-]/g, '');
    this.national.set(cleaned);
    this.emit();
  }

  protected onBlur(): void {
    this.onTouched();
  }

  private emit(): void {
    const digits = this.national().replace(/\D/g, '');
    this.onChange(digits ? this.selected().dial + digits : '');
  }
}

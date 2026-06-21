import { OverlayModule, ConnectedPosition } from '@angular/cdk/overlay';
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
import { RpIcon } from '../icon/rp-icon';

interface DayCell {
  date: Date;
  day: number;
  outside: boolean;
  today: boolean;
  selected: boolean;
  disabled: boolean;
}

/** Date picker with a self-contained month calendar on a CDK overlay. */
@Component({
  selector: 'rp-datepicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OverlayModule, RpIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RpDatepicker),
      multi: true,
    },
  ],
  template: `
    <button
      type="button"
      class="rp-dp"
      cdkOverlayOrigin
      #trigger="cdkOverlayOrigin"
      [class.rp-dp--invalid]="invalid()"
      [class.rp-dp--open]="open()"
      [disabled]="disabled()"
      aria-haspopup="dialog"
      [attr.aria-expanded]="open()"
      (click)="toggle()"
      (keydown.escape)="close()"
      (blur)="onTouched()"
    >
      <span class="rp-dp__value" [class.rp-dp__value--placeholder]="!value()">
        {{ value() ? formatted() : placeholder() }}
      </span>
      <rp-icon class="rp-dp__icon" name="calendar" [size]="18" />
    </button>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="positions"
      (overlayOutsideClick)="close()"
      (detach)="close()"
    >
      <div class="rp-cal" role="dialog" aria-label="Choose date">
        <div class="rp-cal__head">
          <button type="button" class="rp-cal__nav" aria-label="Previous month" (click)="shiftMonth(-1)">
            <rp-icon name="chevron-down" [size]="18" style="transform:rotate(90deg)" />
          </button>
          <span class="rp-cal__title">{{ monthLabel() }}</span>
          <button type="button" class="rp-cal__nav" aria-label="Next month" (click)="shiftMonth(1)">
            <rp-icon name="chevron-down" [size]="18" style="transform:rotate(-90deg)" />
          </button>
        </div>
        <div class="rp-cal__grid rp-cal__grid--dow">
          @for (d of dow; track d) {
            <span class="rp-cal__dow">{{ d }}</span>
          }
        </div>
        <div class="rp-cal__grid">
          @for (cell of cells(); track cell.date.getTime()) {
            <button
              type="button"
              class="rp-cal__day"
              [class.rp-cal__day--outside]="cell.outside"
              [class.rp-cal__day--today]="cell.today"
              [class.rp-cal__day--selected]="cell.selected"
              [disabled]="cell.disabled"
              (click)="pick(cell)"
            >
              {{ cell.day }}
            </button>
          }
        </div>
        <div class="rp-cal__foot">
          <button type="button" class="rp-cal__today" (click)="pickToday()">Today</button>
        </div>
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .rp-dp {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        min-height: 40px;
        padding: 0 12px;
        background: var(--rp-surface);
        border: 1px solid var(--rp-border-strong);
        border-radius: var(--rp-radius-md);
        font-family: var(--rp-font-family-sans);
        font-size: var(--rp-font-size-base);
        color: var(--rp-text);
        cursor: pointer;
        text-align: left;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .rp-dp:focus-visible,
      .rp-dp--open {
        outline: 0;
        border-color: var(--rp-brand);
        box-shadow: 0 0 0 3px
          color-mix(in srgb, var(--rp-brand) 18%, transparent);
      }
      .rp-dp--invalid {
        border-color: var(--rp-danger);
      }
      .rp-dp:disabled {
        background: var(--rp-surface-sunken);
        opacity: 0.7;
        cursor: not-allowed;
      }
      .rp-dp__value {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .rp-dp__value--placeholder {
        color: var(--rp-text-subtle);
      }
      .rp-dp__icon {
        color: var(--rp-text-muted);
      }
    `,
    `
      .rp-cal {
        margin-top: 4px;
        width: 272px;
        background: var(--rp-surface);
        border: 1px solid var(--rp-border);
        border-radius: var(--rp-radius-md);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        padding: 10px;
        font-family: var(--rp-font-family-sans);
      }
      .rp-cal__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .rp-cal__title {
        font-size: var(--rp-font-size-sm);
        font-weight: var(--rp-font-weight-medium);
        color: var(--rp-text);
      }
      .rp-cal__nav {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border: 0;
        border-radius: var(--rp-radius-sm);
        background: transparent;
        color: var(--rp-text-muted);
        cursor: pointer;
      }
      .rp-cal__nav:hover {
        background: var(--rp-surface-sunken);
        color: var(--rp-text);
      }
      .rp-cal__grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
      }
      .rp-cal__grid--dow {
        margin-bottom: 2px;
      }
      .rp-cal__dow {
        text-align: center;
        font-size: var(--rp-font-size-xs);
        color: var(--rp-text-subtle);
        padding: 4px 0;
      }
      .rp-cal__day {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        border: 0;
        border-radius: var(--rp-radius-sm);
        background: transparent;
        color: var(--rp-text);
        font-family: var(--rp-font-family-sans);
        font-size: var(--rp-font-size-sm);
        cursor: pointer;
      }
      .rp-cal__day:hover:not(:disabled):not(.rp-cal__day--selected) {
        background: var(--rp-surface-sunken);
      }
      .rp-cal__day--outside {
        color: var(--rp-text-subtle);
      }
      .rp-cal__day--today {
        font-weight: var(--rp-font-weight-semibold);
        color: var(--rp-color-brand-600);
      }
      .rp-cal__day--selected {
        background: var(--rp-brand);
        color: var(--rp-text-on-brand);
      }
      .rp-cal__day:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
      .rp-cal__foot {
        display: flex;
        justify-content: flex-end;
        margin-top: 8px;
        border-top: 1px solid var(--rp-border);
        padding-top: 8px;
      }
      .rp-cal__today {
        border: 0;
        background: transparent;
        color: var(--rp-color-brand-600);
        font-family: var(--rp-font-family-sans);
        font-size: var(--rp-font-size-sm);
        font-weight: var(--rp-font-weight-medium);
        cursor: pointer;
        padding: 4px 8px;
        border-radius: var(--rp-radius-sm);
      }
      .rp-cal__today:hover {
        background: var(--rp-color-brand-50);
      }
    `,
  ],
})
export class RpDatepicker implements ControlValueAccessor {
  readonly placeholder = input<string>('Select date');
  readonly locale = input<string>('en-MY');
  readonly invalid = input<boolean>(false);
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly value = model<Date | null>(null);

  protected readonly dow = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  protected readonly open = signal(false);
  protected readonly disabled = signal(false);

  private readonly today = new Date();
  protected readonly viewYear = signal(this.today.getFullYear());
  protected readonly viewMonth = signal(this.today.getMonth());

  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
  ];

  protected readonly formatted = computed(() => {
    const v = this.value();
    return v
      ? new Intl.DateTimeFormat(this.locale(), { dateStyle: 'medium' }).format(v)
      : '';
  });

  protected readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat(this.locale(), {
      month: 'long',
      year: 'numeric',
    }).format(new Date(this.viewYear(), this.viewMonth(), 1))
  );

  protected readonly cells = computed<DayCell[]>(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const first = new Date(year, month, 1);
    // Monday-first offset (0 = Monday … 6 = Sunday)
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - offset);
    const sel = this.value();
    const out: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      out.push({
        date,
        day: date.getDate(),
        outside: date.getMonth() !== month,
        today: this.sameDay(date, this.today),
        selected: sel ? this.sameDay(date, sel) : false,
        disabled: this.isDisabled(date),
      });
    }
    return out;
  });

  private onChange: (value: Date | null) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  writeValue(value: Date | string | null): void {
    const date = value ? new Date(value) : null;
    const valid = date && !Number.isNaN(date.getTime()) ? date : null;
    this.value.set(valid);
    if (valid) {
      this.viewYear.set(valid.getFullYear());
      this.viewMonth.set(valid.getMonth());
    }
  }
  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected toggle(): void {
    if (this.open()) this.close();
    else this.openPanel();
  }
  protected openPanel(): void {
    if (this.disabled()) return;
    const v = this.value() ?? this.today;
    this.viewYear.set(v.getFullYear());
    this.viewMonth.set(v.getMonth());
    this.open.set(true);
  }
  protected close(): void {
    this.open.set(false);
  }

  protected shiftMonth(delta: number): void {
    const d = new Date(this.viewYear(), this.viewMonth() + delta, 1);
    this.viewYear.set(d.getFullYear());
    this.viewMonth.set(d.getMonth());
  }

  protected pick(cell: DayCell): void {
    if (cell.disabled) return;
    this.commit(cell.date);
  }
  protected pickToday(): void {
    if (this.isDisabled(this.today)) return;
    this.commit(new Date(this.today));
  }

  private commit(date: Date): void {
    this.value.set(date);
    this.onChange(date);
    this.onTouched();
    this.close();
  }

  private isDisabled(date: Date): boolean {
    const min = this.min();
    const max = this.max();
    if (min && date < this.startOfDay(min)) return true;
    if (max && date > this.endOfDay(max)) return true;
    return false;
  }
  private sameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  private endOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
  }
}

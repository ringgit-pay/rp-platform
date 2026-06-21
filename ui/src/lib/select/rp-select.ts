import { OverlayModule, ConnectedPosition } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RpIcon } from '../icon/rp-icon';

export interface RpSelectOption {
  label: string;
  value: unknown;
  disabled?: boolean;
}

let nextSelectId = 0;

/** Single-select dropdown built on CDK overlay. Implements ControlValueAccessor. */
@Component({
  selector: 'rp-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OverlayModule, RpIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RpSelect),
      multi: true,
    },
  ],
  template: `
    <div
      role="combobox"
      class="rp-select"
      cdkOverlayOrigin
      #trigger="cdkOverlayOrigin"
      [class.rp-select--invalid]="invalid()"
      [class.rp-select--open]="open()"
      [attr.tabindex]="disabled() ? -1 : 0"
      [attr.aria-disabled]="disabled() || null"
      aria-haspopup="listbox"
      [attr.aria-controls]="panelId"
      [attr.aria-expanded]="open()"
      (click)="toggle()"
      (keydown.arrowDown)="onArrow($event, 1)"
      (keydown.arrowUp)="onArrow($event, -1)"
      (keydown.enter)="onEnter($event)"
      (keydown.escape)="close()"
      (blur)="onTouched()"
    >
      <span class="rp-select__value" [class.rp-select__value--placeholder]="!selected()">
        {{ selected()?.label ?? placeholder() }}
      </span>
      @if (clearable() && selected() && !disabled()) {
        <button type="button" class="rp-select__clear" aria-label="Clear"
              (click)="clear($event)">
          <rp-icon name="x" [size]="15" />
        </button>
      }
      <rp-icon class="rp-select__chev" name="chevron-down" [size]="18" />
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayWidth]="triggerWidth()"
      [cdkConnectedOverlayPositions]="positions"
      (overlayOutsideClick)="close()"
      (detach)="close()"
    >
      <div class="rp-select__panel" role="listbox" [id]="panelId">
        @for (opt of options(); track $index; let i = $index) {
          <button
            type="button"
            class="rp-select__option"
            role="option"
            [class.rp-select__option--active]="opt.value === value()"
            [class.rp-select__option--highlight]="i === highlight()"
            [attr.aria-selected]="opt.value === value()"
            [disabled]="opt.disabled"
            (click)="choose(opt)"
            (mouseenter)="highlight.set(i)"
          >
            <span>{{ opt.label }}</span>
            @if (opt.value === value()) {
              <rp-icon name="check" [size]="16" />
            }
          </button>
        }
        @if (!options().length) {
          <div class="rp-select__empty">No options</div>
        }
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .rp-select {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        min-height: 40px;
        padding: 0 10px 0 12px;
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
      .rp-select:focus-visible,
      .rp-select--open {
        outline: 0;
        border-color: var(--rp-brand);
        box-shadow: 0 0 0 3px
          color-mix(in srgb, var(--rp-brand) 18%, transparent);
      }
      .rp-select--invalid {
        border-color: var(--rp-danger);
      }
      .rp-select[aria-disabled='true'] {
        background: var(--rp-surface-sunken);
        opacity: 0.7;
        cursor: not-allowed;
      }
      .rp-select__value {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .rp-select__value--placeholder {
        color: var(--rp-text-subtle);
      }
      .rp-select__clear {
        display: inline-flex;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--rp-text-muted);
        cursor: pointer;
      }
      .rp-select__clear:hover {
        color: var(--rp-text);
      }
      .rp-select__clear:focus-visible {
        outline: 2px solid var(--rp-brand);
        outline-offset: 2px;
        border-radius: var(--rp-radius-sm);
      }
      .rp-select__chev {
        color: var(--rp-text-muted);
        transition: transform 0.18s ease;
      }
      .rp-select--open .rp-select__chev {
        transform: rotate(180deg);
      }
    `,
    `
      .rp-select__panel {
        margin-top: 4px;
        max-height: 280px;
        overflow-y: auto;
        background: var(--rp-surface);
        border: 1px solid var(--rp-border);
        border-radius: var(--rp-radius-md);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        padding: 4px;
      }
      .rp-select__option {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        width: 100%;
        padding: 9px 10px;
        border: 0;
        border-radius: var(--rp-radius-sm);
        background: transparent;
        font-family: var(--rp-font-family-sans);
        font-size: var(--rp-font-size-base);
        color: var(--rp-text);
        cursor: pointer;
        text-align: left;
      }
      .rp-select__option--highlight {
        background: var(--rp-surface-sunken);
      }
      .rp-select__option--active {
        color: var(--rp-color-brand-700);
        font-weight: var(--rp-font-weight-medium);
      }
      .rp-select__option:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .rp-select__empty {
        padding: 10px;
        color: var(--rp-text-muted);
        font-family: var(--rp-font-family-sans);
        font-size: var(--rp-font-size-sm);
      }
    `,
  ],
})
export class RpSelect implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);

  /** Unique id linking the combobox trigger to its listbox panel (aria-controls). */
  protected readonly panelId = `rp-select-panel-${nextSelectId++}`;

  readonly options = input<RpSelectOption[]>([]);
  readonly placeholder = input<string>('Select…');
  readonly clearable = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly value = model<unknown>(null);

  protected readonly open = signal(false);
  protected readonly disabled = signal(false);
  protected readonly highlight = signal(-1);
  protected readonly triggerWidth = signal<number>(0);

  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
  ];

  protected readonly selected = computed<RpSelectOption | undefined>(() =>
    this.options().find((o) => o.value === this.value())
  );

  private onChange: (value: unknown) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

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

  protected toggle(): void {
    if (this.open()) this.close();
    else this.openPanel();
  }

  protected openPanel(): void {
    if (this.disabled()) return;
    this.triggerWidth.set(
      (this.host.nativeElement.firstElementChild as HTMLElement)?.offsetWidth ?? 0
    );
    this.highlight.set(this.options().findIndex((o) => o.value === this.value()));
    this.open.set(true);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected choose(opt: RpSelectOption): void {
    if (opt.disabled) return;
    this.value.set(opt.value);
    this.onChange(opt.value);
    this.onTouched();
    this.close();
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.value.set(null);
    this.onChange(null);
  }

  protected onArrow(event: Event, dir: number): void {
    event.preventDefault();
    if (!this.open()) {
      this.openPanel();
      return;
    }
    const count = this.options().length;
    if (!count) return;
    let i = this.highlight();
    do {
      i = (i + dir + count) % count;
    } while (this.options()[i]?.disabled && i !== this.highlight());
    this.highlight.set(i);
  }

  protected onEnter(event: Event): void {
    if (!this.open()) {
      this.openPanel();
      return;
    }
    event.preventDefault();
    const opt = this.options()[this.highlight()];
    if (opt) this.choose(opt);
  }
}

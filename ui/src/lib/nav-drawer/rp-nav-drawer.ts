import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  signal,
} from '@angular/core';
import { RpIcon } from '../icon/rp-icon';
import { RpNavItem } from '../sidebar/rp-sidebar';

/**
 * Mobile left slide-in navigation drawer. Shows the full hierarchical nav
 * tree (parents expand to reveal children). Sits absolutely inside its host
 * container, so the parent shell must be `position: relative; overflow: hidden`.
 */
@Component({
  selector: 'rp-nav-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RpIcon],
  host: { '(keydown.escape)': 'open.set(false)' },
  template: `
    <div
      class="rp-nd__overlay"
      [class.rp-nd__overlay--open]="open()"
      aria-hidden="true"
      (click)="open.set(false)"
    ></div>

    <aside
      class="rp-nd"
      [class.rp-nd--open]="open()"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <div class="rp-nd__head">
        <span class="rp-nd__logo">
          <span class="rp-nd__logo-badge">{{ logoInitial() }}</span>
          {{ logoText() }}
        </span>
        <button
          class="rp-nd__close"
          type="button"
          aria-label="Close menu"
          (click)="open.set(false)"
        >
          <rp-icon name="x" [size]="20" />
        </button>
      </div>

      <nav class="rp-nd__nav" aria-label="Main navigation">
        @for (item of items(); track item.id) {
          @if (item.children?.length) {
            <button
              class="rp-nd__group"
              type="button"
              [class.rp-nd__group--active]="containsActive(item)"
              [attr.aria-expanded]="isExpanded(item)"
              (click)="toggle(item)"
            >
              <rp-icon [name]="item.icon" [size]="19" />
              <span class="rp-nd__label">{{ item.label }}</span>
              <rp-icon
                class="rp-nd__chev"
                [class.rp-nd__chev--open]="isExpanded(item)"
                name="chevron-right"
                [size]="16"
              />
            </button>
            @if (isExpanded(item)) {
              <div class="rp-nd__children">
                @for (child of item.children!; track child.id) {
                  <button
                    class="rp-nd__child"
                    type="button"
                    [class.rp-nd__child--active]="child.id === active()"
                    (click)="select(child)"
                  >
                    <rp-icon [name]="child.icon" [size]="16" />
                    {{ child.label }}
                  </button>
                }
              </div>
            }
          } @else {
            <button
              class="rp-nd__group"
              type="button"
              [class.rp-nd__group--active]="item.id === active()"
              (click)="select(item)"
            >
              <rp-icon [name]="item.icon" [size]="19" />
              <span class="rp-nd__label">{{ item.label }}</span>
            </button>
          }
        }
      </nav>
    </aside>
  `,
  styles: [
    `
      :host {
        position: absolute;
        inset: 0;
        z-index: 50;
        pointer-events: none;
      }
      .rp-nd__overlay {
        position: absolute;
        inset: 0;
        background: rgba(15, 23, 42, 0);
        pointer-events: none;
        transition: background 0.25s ease;
      }
      .rp-nd__overlay--open {
        background: rgba(15, 23, 42, 0.42);
        pointer-events: auto;
      }
      .rp-nd {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 280px;
        max-width: 84%;
        background: var(--rp-surface);
        display: flex;
        flex-direction: column;
        transform: translateX(-100%);
        transition: transform 0.26s ease;
        pointer-events: auto;
        box-shadow: 2px 0 20px rgba(0, 0, 0, 0.14);
      }
      .rp-nd--open {
        transform: translateX(0);
      }
      .rp-nd__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 52px;
        padding: 0 12px 0 16px;
        border-bottom: 1px solid var(--rp-border);
        flex-shrink: 0;
      }
      .rp-nd__logo {
        display: flex;
        align-items: center;
        gap: 9px;
        font-family: var(--rp-font-family-sans);
        font-weight: 600;
        font-size: 14px;
        letter-spacing: 0.04em;
        color: var(--rp-text);
      }
      .rp-nd__logo-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 7px;
        background: var(--rp-brand);
        color: var(--rp-text-on-brand);
        font-size: 12px;
        font-weight: 600;
      }
      .rp-nd__close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: var(--rp-text-muted);
        cursor: pointer;
      }
      .rp-nd__close:hover {
        background: var(--rp-surface-sunken);
      }
      .rp-nd__nav {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .rp-nd__group {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 11px 12px;
        border: 0;
        border-radius: 9px;
        background: transparent;
        color: var(--rp-text);
        font-family: var(--rp-font-family-sans);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        text-align: left;
        transition: background-color 0.1s ease, color 0.1s ease;
      }
      .rp-nd__group:hover {
        background: var(--rp-surface-sunken);
      }
      .rp-nd__group--active {
        color: var(--rp-color-brand-700);
        background: var(--rp-color-brand-50);
      }
      .rp-nd__label {
        flex: 1;
      }
      .rp-nd__chev {
        margin-left: auto;
        color: var(--rp-text-subtle);
        transition: transform 0.2s ease;
      }
      .rp-nd__chev--open {
        transform: rotate(90deg);
      }
      .rp-nd__children {
        display: flex;
        flex-direction: column;
        gap: 1px;
        padding: 1px 0 5px;
      }
      .rp-nd__child {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 9px 12px 9px 42px;
        border: 0;
        border-radius: 9px;
        background: transparent;
        color: var(--rp-text-muted);
        font-family: var(--rp-font-family-sans);
        font-size: 13px;
        cursor: pointer;
        text-align: left;
        transition: background-color 0.1s ease, color 0.1s ease;
      }
      .rp-nd__child:hover {
        background: var(--rp-surface-sunken);
        color: var(--rp-text);
      }
      .rp-nd__child--active {
        color: var(--rp-color-brand-700);
        background: var(--rp-color-brand-50);
        font-weight: 500;
      }
    `,
  ],
})
export class RpNavDrawer {
  readonly items = input<RpNavItem[]>([]);
  readonly logoText = input<string>('RinggitPay');
  readonly open = model<boolean>(false);
  readonly active = model<string>('');

  /** Per-item expand override; unset items default to "expanded if active". */
  private readonly override = signal<Map<string, boolean>>(new Map());

  protected readonly logoInitial = computed(() =>
    this.logoText().charAt(0).toUpperCase()
  );

  protected containsActive(item: RpNavItem): boolean {
    if (item.id === this.active()) return true;
    return item.children?.some((c) => c.id === this.active()) ?? false;
  }

  protected isExpanded(item: RpNavItem): boolean {
    const o = this.override().get(item.id);
    return o ?? this.containsActive(item);
  }

  protected toggle(item: RpNavItem): void {
    const next = !this.isExpanded(item);
    this.override.update((m) => {
      const n = new Map(m);
      n.set(item.id, next);
      return n;
    });
  }

  protected select(item: RpNavItem): void {
    this.active.set(item.id);
    this.open.set(false);
  }
}

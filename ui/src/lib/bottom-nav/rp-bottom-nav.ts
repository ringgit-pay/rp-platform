import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { RpIcon } from '../icon/rp-icon';
import { RpNavItem } from '../sidebar/rp-sidebar';

/**
 * Mobile bottom tab bar. Shows the first `tabCount` items as tabs plus a
 * trailing "More" button that emits `moreClick` (wire it to an rp-nav-drawer).
 */
@Component({
  selector: 'rp-bottom-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RpIcon],
  template: `
    <nav class="rp-bn" role="navigation" aria-label="Mobile navigation">
      @for (item of tabItems(); track item.id) {
        <button
          class="rp-bn__tab"
          type="button"
          [class.rp-bn__tab--active]="item.id === active()"
          [attr.aria-current]="item.id === active() ? 'page' : null"
          (click)="onTabClick(item)"
        >
          <rp-icon [name]="item.icon" [size]="20" />
          <span class="rp-bn__tab-label">{{ item.label }}</span>
        </button>
      }
      @if (hasMore()) {
        <button
          class="rp-bn__tab"
          type="button"
          [class.rp-bn__tab--active]="overflowActive()"
          aria-label="More menu"
          (click)="moreClick.emit()"
        >
          <rp-icon name="menu" [size]="20" />
          <span class="rp-bn__tab-label">{{ moreLabel() }}</span>
        </button>
      }
    </nav>
  `,
  styles: [
    `
      :host {
        display: block;
        flex-shrink: 0;
      }
      .rp-bn {
        display: flex;
        align-items: stretch;
        height: 58px;
        background: var(--rp-surface);
        border-top: 1px solid var(--rp-border);
        box-sizing: border-box;
      }
      .rp-bn__tab {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        border: 0;
        background: transparent;
        color: var(--rp-text-muted);
        font-family: var(--rp-font-family-sans);
        cursor: pointer;
        padding: 6px 4px;
        transition: color 0.12s ease;
      }
      .rp-bn__tab:hover {
        color: var(--rp-text);
      }
      .rp-bn__tab--active {
        color: var(--rp-brand);
      }
      .rp-bn__tab-label {
        font-size: 10px;
        font-weight: 500;
        line-height: 1;
      }
    `,
  ],
})
export class RpBottomNav {
  readonly items = input<RpNavItem[]>([]);
  readonly tabCount = input<number>(4);
  readonly moreLabel = input<string>('More');
  readonly active = model<string>('');
  readonly moreClick = output<void>();

  protected readonly tabItems = computed(() =>
    this.items().slice(0, this.tabCount())
  );
  protected readonly overflowItems = computed(() =>
    this.items().slice(this.tabCount())
  );
  protected readonly hasMore = computed(() => this.overflowItems().length > 0);

  /** Highlight "More" when the active item lives in the overflow set. */
  protected readonly overflowActive = computed(() =>
    this.overflowItems().some((i) => i.id === this.active())
  );

  protected onTabClick(item: RpNavItem): void {
    this.active.set(item.id);
  }
}

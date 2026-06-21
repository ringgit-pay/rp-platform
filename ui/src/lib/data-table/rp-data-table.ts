import { NgTemplateOutlet } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  computed,
  contentChild,
  contentChildren,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { RpIcon } from '../icon/rp-icon';
import { RpSpinner } from '../spinner/rp-spinner';
import { RpEmptyState } from '../empty-state/rp-empty-state';
import { RpTag, RpTagColor } from '../tag/rp-tag';
import { RpCellDef } from './rp-cell-def.directive';
import { RpRowDetailDef } from './rp-row-detail.directive';
import {
  RpColumnDef,
  RpSort,
  RpTableDensity,
  RpTableMode,
  RpTableQuery,
} from './rp-data-table.types';

@Component({
  selector: 'rp-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(keydown.escape)': 'closeColMenu()',
  },
  imports: [RpIcon, RpSpinner, RpEmptyState, RpTag, NgTemplateOutlet, ScrollingModule],
  template: `
    <div class="rp-dt">
      @if (searchable() || columnManager() || exportable()) {
        <div class="rp-dt__toolbar">
          @if (searchable()) {
            <div class="rp-dt__search">
              <rp-icon name="search" [size]="16" />
              <input
                type="search"
                aria-label="Search table"
                [placeholder]="searchPlaceholder()"
                [value]="search()"
                (input)="onSearch($event)"
              />
            </div>
          }
          <div class="rp-dt__toolactions">
            @if (columnManager()) {
              <div class="rp-dt__colmenu-wrap">
                <button
                  class="rp-dt__toolbtn"
                  type="button"
                  aria-haspopup="true"
                  [attr.aria-expanded]="colMenuOpen()"
                  (click)="toggleColMenu()"
                >
                  <rp-icon name="settings" [size]="16" /> Columns
                </button>
                @if (colMenuOpen()) {
                  <div class="rp-dt__colmenu" role="menu">
                    @for (col of orderedAllColumns(); track col.key; let i = $index) {
                      <div class="rp-dt__colmenu-item">
                        <label>
                          <input
                            type="checkbox"
                            [checked]="!isHidden(col.key)"
                            (change)="toggleColumn(col.key)"
                          />
                          {{ col.header || col.key }}
                        </label>
                        <span class="rp-dt__colmenu-move">
                          <button
                            type="button"
                            aria-label="Move up"
                            [disabled]="i === 0"
                            (click)="moveColumn(col.key, -1)"
                          >
                            <span style="display:inline-flex;transform:rotate(180deg)">
                              <rp-icon name="chevron-down" [size]="14" />
                            </span>
                          </button>
                          <button
                            type="button"
                            aria-label="Move down"
                            [disabled]="i === orderedAllColumns().length - 1"
                            (click)="moveColumn(col.key, 1)"
                          >
                            <rp-icon name="chevron-down" [size]="14" />
                          </button>
                        </span>
                      </div>
                    }
                  </div>
                }
              </div>
            }
            @if (exportable()) {
              <button class="rp-dt__toolbtn" type="button" (click)="exportCsv()">
                <rp-icon name="download" [size]="16" /> Export
              </button>
            }
          </div>
        </div>
      }

      @if (selectable() && selectedCount() > 0) {
        <div class="rp-dt__bulkbar">
          <span class="rp-dt__bulkcount">{{ selectedCount() }} selected</span>
          <ng-content select="[rp-bulk-actions]" />
          <button class="rp-dt__bulkclear" type="button" (click)="clearSelection()">Clear</button>
        </div>
      }

      @if (virtualScroll()) {
        <div class="rp-dt__vhead">
          @if (selectable()) {
            <div class="rp-dt__vcell rp-dt__check-col">
              <input
                type="checkbox"
                aria-label="Select all rows on this page"
                [checked]="allOnPageSelected()"
                [indeterminate]="someOnPageSelected()"
                (change)="toggleAll($event)"
              />
            </div>
          }
          @for (col of visibleColumns(); track col.key) {
            <div
              class="rp-dt__vcell rp-dt__vhcell"
              [class]="thClass(col)"
              [style.flex]="flexFor(col)"
              role="columnheader"
              [attr.aria-sort]="ariaSort(col)"
            >
              @if (col.sortable) {
                @let m = sortMeta(col);
                <button type="button" class="rp-dt__th-btn" (click)="toggleSort(col, $event)">
                  {{ col.header }}
                  <span
                    class="rp-dt__sort"
                    [class.rp-dt__sort--active]="m.active"
                    [class.rp-dt__sort--asc]="m.asc"
                  >
                    <rp-icon name="chevron-down" [size]="14" />
                  </span>
                </button>
              } @else {
                {{ col.header }}
              }
            </div>
          }
        </div>
        <cdk-virtual-scroll-viewport
          class="rp-dt__vbody"
          [itemSize]="itemSize()"
          [style.height]="viewportHeight()"
        >
          <div
            class="rp-dt__vrow"
            *cdkVirtualFor="let row of filtered()"
            [style.height.px]="itemSize()"
          >
            @if (selectable()) {
              <div class="rp-dt__vcell rp-dt__check-col">
                <input
                  type="checkbox"
                  aria-label="Select row"
                  [checked]="isSelected(row)"
                  (change)="toggleRow(row)"
                />
              </div>
            }
            @for (col of visibleColumns(); track col.key) {
              <div class="rp-dt__vcell" [class]="tdClass(col)" [style.flex]="flexFor(col)">
                @if (cellTemplate(col.key); as tpl) {
                  <ng-container
                    [ngTemplateOutlet]="tpl"
                    [ngTemplateOutletContext]="{
                      $implicit: row,
                      value: cellValue(row, col),
                      col: col
                    }"
                  />
                } @else if (col.type === 'badge') {
                  <rp-tag [color]="badgeTone(col, row)" [dot]="true">{{ cellValue(row, col) }}</rp-tag>
                } @else {
                  {{ cellValue(row, col) }}
                }
              </div>
            }
          </div>
        </cdk-virtual-scroll-viewport>
      } @else {
      <div
        class="rp-dt__scroll"
        [class.rp-dt__scroll--sticky]="stickyHeader()"
        [style.maxHeight]="maxHeight() || null"
      >
        <table
          class="rp-dt__table"
          [class.rp-dt__table--striped]="striped()"
          [class.rp-dt__table--compact]="density() === 'compact'"
        >
          <thead>
            <tr>
              @if (selectable()) {
                <th class="rp-dt__check-col">
                  <input
                    type="checkbox"
                    aria-label="Select all rows on this page"
                    [checked]="allOnPageSelected()"
                    [indeterminate]="someOnPageSelected()"
                    (change)="toggleAll($event)"
                  />
                </th>
              }
              @if (expandable()) {
                <th class="rp-dt__expand-col"></th>
              }
              @for (col of visibleColumns(); track col.key) {
                <th
                  [class]="thClass(col)"
                  [style.width]="colWidth(col)"
                  [attr.aria-sort]="ariaSort(col)"
                >
                  @if (col.sortable) {
                    @let m = sortMeta(col);
                    <button type="button" class="rp-dt__th rp-dt__th-btn" (click)="toggleSort(col, $event)">
                      {{ col.header }}
                      <span
                        class="rp-dt__sort"
                        [class.rp-dt__sort--active]="m.active"
                        [class.rp-dt__sort--asc]="m.asc"
                      >
                        <rp-icon name="chevron-down" [size]="14" />
                        @if (m.active && multiSortActive()) {
                          <sup class="rp-dt__sortorder">{{ m.order }}</sup>
                        }
                      </span>
                    </button>
                  } @else {
                    <span class="rp-dt__th">{{ col.header }}</span>
                  }
                  @if (resizable()) {
                    <span
                      class="rp-dt__resize"
                      aria-hidden="true"
                      (mousedown)="startResize(col, $event)"
                    ></span>
                  }
                </th>
              }
            </tr>
            @if (hasFilters()) {
              <tr class="rp-dt__filterrow">
                @if (selectable()) {
                  <th class="rp-dt__check-col"></th>
                }
                @if (expandable()) {
                  <th class="rp-dt__expand-col"></th>
                }
                @for (col of visibleColumns(); track col.key) {
                  <th [class]="thClass(col)">
                    @if (col.filter === 'text') {
                      <input
                        class="rp-dt__filter"
                        type="text"
                        placeholder="Filter"
                        (input)="onFilter(col.key, $event)"
                      />
                    } @else if (col.filter === 'select') {
                      <select class="rp-dt__filter" (change)="onFilter(col.key, $event)">
                        <option value="">All</option>
                        @for (o of col.filterOptions ?? []; track o.value) {
                          <option [value]="o.value">{{ o.label }}</option>
                        }
                      </select>
                    }
                  </th>
                }
              </tr>
            }
          </thead>
          <tbody>
            @if (loading()) {
              <tr>
                <td [attr.colspan]="colCount()" class="rp-dt__state"><rp-spinner /></td>
              </tr>
            } @else if (pageRows().length === 0) {
              <tr>
                <td [attr.colspan]="colCount()" class="rp-dt__state">
                  <rp-empty-state icon="search" heading="No results" [description]="emptyText()" />
                </td>
              </tr>
            } @else {
              @for (row of pageRows(); track $index) {
                <tr class="rp-dt__row">
                  @if (selectable()) {
                    <td class="rp-dt__check-col">
                      <input
                        type="checkbox"
                        aria-label="Select row"
                        [checked]="isSelected(row)"
                        (change)="toggleRow(row)"
                      />
                    </td>
                  }
                  @if (expandable()) {
                    <td class="rp-dt__expand-col">
                      <button
                        class="rp-dt__expand"
                        type="button"
                        aria-label="Expand row"
                        [class.rp-dt__expand--open]="isExpanded(row)"
                        (click)="toggleExpand(row)"
                      >
                        <rp-icon name="chevron-right" [size]="16" />
                      </button>
                    </td>
                  }
                  @for (col of visibleColumns(); track col.key) {
                    <td [class]="tdClass(col)" [attr.data-label]="col.header">
                      @if (cellTemplate(col.key); as tpl) {
                        <ng-container
                          [ngTemplateOutlet]="tpl"
                          [ngTemplateOutletContext]="{
                            $implicit: row,
                            value: cellValue(row, col),
                            col: col
                          }"
                        />
                      } @else if (col.type === 'badge') {
                        <rp-tag [color]="badgeTone(col, row)" [dot]="true">{{ cellValue(row, col) }}</rp-tag>
                      } @else {
                        {{ cellValue(row, col) }}
                      }
                    </td>
                  }
                </tr>
                @if (expandable() && isExpanded(row)) {
                  <tr class="rp-dt__detail">
                    <td [attr.colspan]="colCount()">
                      @if (rowDetail(); as tpl) {
                        <ng-container
                          [ngTemplateOutlet]="tpl"
                          [ngTemplateOutletContext]="{ $implicit: row }"
                        />
                      }
                    </td>
                  </tr>
                }
              }
            }
          </tbody>
        </table>
      </div>

      <div class="rp-dt__footer">
        <div class="rp-dt__pagesize">
          <span>Rows</span>
          <select (change)="changePageSize($event)">
            @for (n of pageSizeOptions(); track n) {
              <option [value]="n" [selected]="n === pageSize()">{{ n }}</option>
            }
          </select>
        </div>
        <div class="rp-dt__range">{{ rangeLabel() }}</div>
        <div class="rp-dt__pager">
          <button
            type="button"
            aria-label="Previous page"
            [disabled]="page() <= 1"
            (click)="goPage(page() - 1)"
          >
            <rp-icon name="arrow-left" [size]="16" />
          </button>
          <button
            type="button"
            aria-label="Next page"
            [disabled]="page() >= totalPages()"
            (click)="goPage(page() + 1)"
          >
            <span class="rp-dt__next"><rp-icon name="chevron-right" [size]="16" /></span>
          </button>
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .rp-dt {
        background: var(--rp-surface);
        border: 1px solid var(--rp-border);
        border-radius: var(--rp-radius-lg);
        font-family: var(--rp-font-family-sans);
        overflow: hidden;
      }
      .rp-dt__toolbar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-bottom: 1px solid var(--rp-border);
      }
      .rp-dt__toolactions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: auto;
      }
      .rp-dt__toolbtn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 36px;
        padding: 0 12px;
        border: 1px solid var(--rp-border-strong);
        border-radius: var(--rp-radius-md);
        background: var(--rp-surface);
        color: var(--rp-text);
        font-family: var(--rp-font-family-sans);
        font-size: var(--rp-font-size-sm);
        cursor: pointer;
      }
      .rp-dt__toolbtn:hover {
        background: var(--rp-surface-sunken);
      }
      .rp-dt__colmenu-wrap {
        position: relative;
      }
      .rp-dt__colmenu {
        position: absolute;
        right: 0;
        top: calc(100% + 4px);
        z-index: 20;
        min-width: 220px;
        background: var(--rp-surface);
        border: 1px solid var(--rp-border-strong);
        border-radius: var(--rp-radius-md);
        box-shadow: var(--rp-shadow-md);
        padding: 6px;
      }
      .rp-dt__colmenu-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 6px 8px;
        border-radius: var(--rp-radius-sm);
        font-size: var(--rp-font-size-sm);
        color: var(--rp-text);
      }
      .rp-dt__colmenu-item:hover {
        background: var(--rp-surface-muted);
      }
      .rp-dt__colmenu-item label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }
      .rp-dt__colmenu-item input {
        accent-color: var(--rp-brand);
      }
      .rp-dt__colmenu-move button {
        border: 0;
        background: transparent;
        color: var(--rp-text-muted);
        cursor: pointer;
        padding: 2px;
      }
      .rp-dt__colmenu-move button:disabled {
        opacity: 0.3;
        cursor: default;
      }
      .rp-dt__search {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-width: 260px;
        padding: 0 10px;
        height: 36px;
        background: var(--rp-surface);
        border: 1px solid var(--rp-border-strong);
        border-radius: var(--rp-radius-md);
        color: var(--rp-text-subtle);
      }
      .rp-dt__search:focus-within {
        border-color: var(--rp-brand);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--rp-brand) 18%, transparent);
      }
      .rp-dt__search input {
        flex: 1;
        border: 0;
        outline: 0;
        background: transparent;
        font-size: var(--rp-font-size-base);
        color: var(--rp-text);
      }
      .rp-dt__bulkbar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        background: var(--rp-color-brand-50);
        border-bottom: 1px solid var(--rp-border);
        font-size: var(--rp-font-size-sm);
        color: var(--rp-color-brand-700);
      }
      .rp-dt__bulkcount {
        font-weight: var(--rp-font-weight-medium);
      }
      .rp-dt__bulkclear {
        margin-left: auto;
        border: 0;
        background: transparent;
        color: var(--rp-brand);
        cursor: pointer;
        font-family: var(--rp-font-family-sans);
        font-size: var(--rp-font-size-sm);
      }
      .rp-dt__scroll {
        overflow: auto;
      }
      .rp-dt__table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--rp-font-size-base);
      }
      .rp-dt__table th,
      .rp-dt__table td {
        text-align: left;
        padding: 12px 14px;
        border-bottom: 1px solid var(--rp-border);
        color: var(--rp-text);
        white-space: nowrap;
      }
      .rp-dt__table th {
        position: relative;
        color: var(--rp-text-muted);
        font-weight: var(--rp-font-weight-medium);
        font-size: var(--rp-font-size-sm);
        background: var(--rp-surface-muted);
        user-select: none;
      }
      .rp-dt__table--compact th,
      .rp-dt__table--compact td {
        padding-top: 6px;
        padding-bottom: 6px;
      }
      .rp-dt__scroll--sticky thead th {
        position: sticky;
        top: 0;
        z-index: 2;
      }
      .rp-dt__table--striped tbody tr.rp-dt__row:nth-of-type(even) td {
        background: var(--rp-surface-muted);
      }
      .rp-dt__resize {
        position: absolute;
        top: 0;
        right: -3px;
        width: 6px;
        height: 100%;
        cursor: col-resize;
        z-index: 3;
      }
      .rp-dt__resize:hover {
        background: color-mix(in srgb, var(--rp-brand) 40%, transparent);
      }
      .rp-dt__check-col,
      .rp-dt__expand-col {
        width: 1%;
        white-space: nowrap;
        text-align: center;
      }
      .rp-dt__check-col input {
        width: 16px;
        height: 16px;
        accent-color: var(--rp-brand);
        cursor: pointer;
      }
      .rp-dt__expand {
        display: inline-flex;
        border: 0;
        background: transparent;
        color: var(--rp-text-muted);
        cursor: pointer;
        transition: transform 0.15s ease, color 0.15s ease;
      }
      .rp-dt__expand--open {
        transform: rotate(90deg);
        color: var(--rp-brand);
      }
      .rp-dt__detail td {
        background: var(--rp-surface-muted);
        padding: 14px 18px;
        white-space: normal;
      }
      .rp-dt__col--sortable {
        cursor: pointer;
      }
      .rp-dt__col--right {
        text-align: right;
      }
      .rp-dt__col--center {
        text-align: center;
      }
      .rp-dt__th {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      /* Sortable header trigger — native button reset so it's keyboard-focusable
         while looking like a plain header cell. */
      .rp-dt__th-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 0;
        margin: 0;
        border: 0;
        background: transparent;
        font: inherit;
        color: inherit;
        letter-spacing: inherit;
        text-align: left;
        cursor: pointer;
      }
      .rp-dt__th-btn:focus-visible {
        outline: 2px solid var(--rp-brand);
        outline-offset: 2px;
        border-radius: var(--rp-radius-sm);
      }
      .rp-dt__sort {
        display: inline-flex;
        align-items: center;
        opacity: 0;
        transition: opacity 0.12s ease, transform 0.12s ease;
      }
      .rp-dt__col--sortable:hover .rp-dt__sort {
        opacity: 0.5;
      }
      .rp-dt__sort--active {
        opacity: 1 !important;
        color: var(--rp-brand);
      }
      .rp-dt__sort--asc {
        transform: rotate(180deg);
      }
      .rp-dt__sortorder {
        font-size: 10px;
        margin-left: 1px;
        color: var(--rp-brand);
      }
      .rp-dt__filterrow th {
        padding: 6px 10px;
        background: var(--rp-surface);
      }
      .rp-dt__filter {
        width: 100%;
        box-sizing: border-box;
        height: 30px;
        padding: 0 8px;
        border: 1px solid var(--rp-border);
        border-radius: var(--rp-radius-sm);
        background: var(--rp-surface);
        color: var(--rp-text);
        font-size: var(--rp-font-size-sm);
        font-family: var(--rp-font-family-sans);
      }
      .rp-dt__row:hover td {
        background: var(--rp-surface-sunken);
      }
      .rp-dt__state {
        text-align: center;
        padding: 24px;
      }
      .rp-dt__footer {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 10px 14px;
        border-top: 1px solid var(--rp-border);
        font-size: var(--rp-font-size-sm);
        color: var(--rp-text-muted);
      }
      .rp-dt__pagesize {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .rp-dt__pagesize select {
        height: 30px;
        border: 1px solid var(--rp-border-strong);
        border-radius: var(--rp-radius-sm);
        background: var(--rp-surface);
        color: var(--rp-text);
        font-family: var(--rp-font-family-sans);
      }
      .rp-dt__range {
        margin-left: auto;
      }
      .rp-dt__pager {
        display: flex;
        gap: 4px;
      }
      .rp-dt__pager button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: 1px solid var(--rp-border-strong);
        border-radius: var(--rp-radius-md);
        background: var(--rp-surface);
        color: var(--rp-text);
        cursor: pointer;
      }
      .rp-dt__pager button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .rp-dt__next {
        display: inline-flex;
      }
      .rp-dt__vhead {
        display: flex;
        background: var(--rp-surface-muted);
        border-bottom: 1px solid var(--rp-border);
      }
      .rp-dt__vbody {
        display: block;
        width: 100%;
      }
      .rp-dt__vrow {
        display: flex;
        border-bottom: 1px solid var(--rp-border);
      }
      .rp-dt__vrow:hover {
        background: var(--rp-surface-sunken);
      }
      .rp-dt__vcell {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 0 14px;
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: var(--rp-text);
        font-size: var(--rp-font-size-base);
      }
      .rp-dt__vcell.rp-dt__col--right {
        justify-content: flex-end;
      }
      .rp-dt__vcell.rp-dt__col--center {
        justify-content: center;
      }
      .rp-dt__vhcell {
        height: 42px;
        font-size: var(--rp-font-size-sm);
        font-weight: var(--rp-font-weight-medium);
        color: var(--rp-text-muted);
        cursor: default;
      }
      .rp-dt__vhcell.rp-dt__col--sortable {
        cursor: pointer;
      }

      @media (max-width: 768px) {
        .rp-dt__table th.rp-dt__col--hide-mobile,
        .rp-dt__table td.rp-dt__col--hide-mobile {
          display: none;
        }
      }

      @media (max-width: 640px) {
        .rp-dt__scroll--sticky thead th {
          position: static;
        }
        .rp-dt__table thead {
          display: none;
        }
        .rp-dt__table,
        .rp-dt__table tbody,
        .rp-dt__table tr,
        .rp-dt__table td {
          display: block;
          width: auto !important;
        }
        .rp-dt__table tr.rp-dt__row {
          border: 1px solid var(--rp-border);
          border-radius: var(--rp-radius-md);
          margin: 10px;
          padding: 4px 0;
        }
        .rp-dt__table td {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          border-bottom: 1px solid var(--rp-border);
          white-space: normal;
          text-align: right;
        }
        .rp-dt__table tr.rp-dt__row td:last-child {
          border-bottom: 0;
        }
        .rp-dt__table td.rp-dt__col--hide-mobile {
          display: none;
        }
        .rp-dt__table td::before {
          content: attr(data-label);
          font-weight: var(--rp-font-weight-medium);
          color: var(--rp-text-muted);
          text-align: left;
        }
        .rp-dt__check-col,
        .rp-dt__expand-col {
          text-align: left;
        }
      }
    `,
  ],
})
export class RpDataTable<T extends Record<string, unknown> = Record<string, unknown>> {
  readonly columns = input<RpColumnDef<T>[]>([]);
  readonly rows = input<T[]>([]);
  /**
   * Stable identity for a row. Provide this whenever the data can be replaced
   * with a new array reference (server paging, refetch) so selection/expansion
   * survive. Falls back to object identity when not supplied.
   */
  readonly rowId = input<(row: T) => string | number>();
  readonly loading = input<boolean>(false);
  readonly mode = input<RpTableMode>('client');
  /** Total row count across all pages — required in server mode. */
  readonly totalCount = input<number>(0);
  readonly searchable = input<boolean>(true);
  readonly searchPlaceholder = input<string>('Search…');
  readonly emptyText = input<string>('Try adjusting your search or filters.');
  readonly pageSizeOptions = input<number[]>([10, 25, 50]);
  readonly stickyHeader = input<boolean>(false);
  readonly maxHeight = input<string>('');
  readonly striped = input<boolean>(false);
  readonly density = input<RpTableDensity>('comfortable');
  readonly selectable = input<boolean>(false);
  readonly expandable = input<boolean>(false);
  readonly columnManager = input<boolean>(false);
  readonly resizable = input<boolean>(false);
  readonly exportable = input<boolean>(false);
  readonly exportFilename = input<string>('export');
  /** Virtual scroll mode — renders 10k+ rows without pagination (no per-column
   * filter row / expand in this mode; uses global search + sort + selection). */
  readonly virtualScroll = input<boolean>(false);
  readonly itemSize = input<number>(44);
  readonly viewportHeight = input<string>('480px');

  readonly queryChange = output<RpTableQuery>();
  readonly selectionChange = output<T[]>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly cellDefs = contentChildren(RpCellDef);
  private readonly cellTemplates = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const def of this.cellDefs()) map.set(def.rpCell(), def.template);
    return map;
  });
  private readonly rowDetailDef = contentChild(RpRowDetailDef);

  protected readonly search = signal('');
  protected readonly sort = signal<RpSort[]>([]);
  protected readonly filters = signal<Record<string, string>>({});
  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  /** Keyed by rowId (or the row object itself when no rowId is provided). */
  private readonly selected = signal<Map<unknown, T>>(new Map());
  private readonly expanded = signal<Set<unknown>>(new Set());
  private readonly hidden = signal<Set<string>>(new Set<string>());
  private readonly order = signal<string[] | null>(null);
  private readonly colWidths = signal<Record<string, string>>({});
  protected readonly colMenuOpen = signal(false);

  protected readonly multiSortActive = computed(() => this.sort().length > 1);
  protected readonly hasFilters = computed(() => this.visibleColumns().some((c) => !!c.filter));
  protected readonly selectedCount = computed(() => this.selected().size);

  /** Stable key for a row — the rowId accessor if given, else the row itself. */
  private keyOf(row: T): unknown {
    const id = this.rowId();
    return id ? id(row) : row;
  }

  /** All columns in current display order (includes hidden ones — for the menu). */
  protected readonly orderedAllColumns = computed<RpColumnDef<T>[]>(() => {
    const cols = this.columns();
    const ord = this.order();
    if (!ord) return cols;
    const map = new Map(cols.map((c) => [c.key, c]));
    const result = ord
      .map((k) => map.get(k))
      .filter((c): c is RpColumnDef<T> => !!c);
    for (const c of cols) if (!ord.includes(c.key)) result.push(c);
    return result;
  });
  protected readonly visibleColumns = computed<RpColumnDef<T>[]>(() =>
    this.orderedAllColumns().filter((c) => !this.hidden().has(c.key))
  );
  protected readonly colCount = computed(
    () =>
      this.visibleColumns().length + (this.selectable() ? 1 : 0) + (this.expandable() ? 1 : 0)
  );

  protected readonly filtered = computed<T[]>(() => {
    if (this.mode() === 'server') return this.rows();
    let data = this.rows();

    const q = this.search().trim().toLowerCase();
    if (q) {
      // Search across ALL columns (including hidden ones), not just visible.
      const cols = this.columns();
      data = data.filter((row) =>
        cols.some((c) => this.cellValue(row, c).toLowerCase().includes(q))
      );
    }

    const filters = this.filters();
    for (const key of Object.keys(filters)) {
      const fv = (filters[key] ?? '').toLowerCase();
      if (fv) {
        data = data.filter((row) => String(row[key] ?? '').toLowerCase().includes(fv));
      }
    }

    const sorts = this.sort();
    if (sorts.length) {
      data = [...data].sort((a, b) => {
        for (const s of sorts) {
          const cmp = this.compareValues(a[s.key], b[s.key]);
          if (cmp !== 0) return s.dir === 'asc' ? cmp : -cmp;
        }
        return 0;
      });
    }
    return data;
  });

  /**
   * Type-aware comparison used for sorting: numbers numerically, dates by
   * timestamp, everything else as locale-aware strings (with numeric collation
   * so "item 2" < "item 10"). Null/undefined always sort last.
   */
  private compareValues(a: unknown, b: unknown): number {
    if (a === b) return 0;
    const aNull = a == null;
    const bNull = b == null;
    if (aNull || bNull) return aNull ? 1 : -1; // nulls last

    if (typeof a === 'number' && typeof b === 'number') return a - b;

    if (a instanceof Date || b instanceof Date) {
      return new Date(a as Date).getTime() - new Date(b as Date).getTime();
    }

    return String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  }

  protected readonly total = computed(() =>
    this.mode() === 'server' ? this.totalCount() : this.filtered().length
  );
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize()))
  );
  protected readonly pageRows = computed<T[]>(() => {
    if (this.mode() === 'server') return this.rows();
    const start = (this.page() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });
  protected readonly rangeLabel = computed(() => {
    const total = this.total();
    if (total === 0) return '0 of 0';
    const start = (this.page() - 1) * this.pageSize() + 1;
    const end = Math.min(this.page() * this.pageSize(), total);
    return `${start}–${end} of ${total}`;
  });

  protected readonly allOnPageSelected = computed(() => {
    const p = this.pageRows();
    const sel = this.selected();
    return p.length > 0 && p.every((r) => sel.has(this.keyOf(r)));
  });
  protected readonly someOnPageSelected = computed(() => {
    const p = this.pageRows();
    const sel = this.selected();
    const n = p.filter((r) => sel.has(this.keyOf(r))).length;
    return n > 0 && n < p.length;
  });

  protected cellValue(row: T, col: RpColumnDef<T>): string {
    const v = col.cell ? col.cell(row) : row[col.key];
    return v == null ? '' : String(v);
  }

  /** Built-in status value → badge tone map (case-insensitive). */
  private static readonly STATUS_TONES: Record<string, RpTagColor> = {
    active: 'success',
    paid: 'success',
    completed: 'success',
    approved: 'success',
    success: 'success',
    pending: 'info',
    scheduled: 'info',
    processing: 'info',
    overdue: 'warning',
    warning: 'warning',
    terminated: 'danger',
    failed: 'danger',
    rejected: 'danger',
    cancelled: 'danger',
    inactive: 'neutral',
    draft: 'neutral',
    closed: 'neutral',
  };
  protected badgeTone(col: RpColumnDef<T>, row: T): RpTagColor {
    const value = this.cellValue(row, col);
    if (col.badgeTone) return col.badgeTone(value, row);
    return RpDataTable.STATUS_TONES[value.trim().toLowerCase()] ?? 'neutral';
  }
  protected cellTemplate(key: string): TemplateRef<unknown> | null {
    return this.cellTemplates().get(key) ?? null;
  }
  protected rowDetail(): TemplateRef<unknown> | null {
    return this.rowDetailDef()?.template ?? null;
  }
  protected colWidth(col: RpColumnDef<T>): string | null {
    return this.colWidths()[col.key] ?? col.width ?? null;
  }
  protected flexFor(col: RpColumnDef<T>): string {
    const w = this.colWidths()[col.key] ?? col.width;
    return w ? `0 0 ${w}` : '1 1 0';
  }

  protected sortMeta(col: RpColumnDef<T>): { active: boolean; asc: boolean; order: number } {
    const idx = this.sort().findIndex((s) => s.key === col.key);
    if (idx < 0) return { active: false, asc: false, order: 0 };
    return { active: true, asc: this.sort()[idx].dir === 'asc', order: idx + 1 };
  }

  protected thClass(col: RpColumnDef<T>): string {
    return this.colClass(col, col.sortable ? 'rp-dt__col--sortable' : '');
  }
  protected tdClass(col: RpColumnDef<T>): string {
    return this.colClass(col, '');
  }
  private colClass(col: RpColumnDef<T>, extra: string): string {
    return [
      extra,
      col.align === 'right' ? 'rp-dt__col--right' : '',
      col.align === 'center' ? 'rp-dt__col--center' : '',
      col.hideOnMobile ? 'rp-dt__col--hide-mobile' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  protected isSelected(row: T): boolean {
    return this.selected().has(this.keyOf(row));
  }
  protected isExpanded(row: T): boolean {
    return this.expanded().has(this.keyOf(row));
  }
  protected isHidden(key: string): boolean {
    return this.hidden().has(key);
  }

  protected toggleRow(row: T): void {
    const next = new Map(this.selected());
    const k = this.keyOf(row);
    if (next.has(k)) next.delete(k);
    else next.set(k, row);
    this.selected.set(next);
    this.selectionChange.emit([...next.values()]);
  }
  protected toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const next = new Map(this.selected());
    for (const r of this.pageRows()) {
      const k = this.keyOf(r);
      if (checked) next.set(k, r);
      else next.delete(k);
    }
    this.selected.set(next);
    this.selectionChange.emit([...next.values()]);
  }
  protected clearSelection(): void {
    this.selected.set(new Map());
    this.selectionChange.emit([]);
  }
  protected toggleExpand(row: T): void {
    const next = new Set(this.expanded());
    const k = this.keyOf(row);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    this.expanded.set(next);
  }

  protected toggleColMenu(): void {
    this.colMenuOpen.update((v) => !v);
  }
  protected closeColMenu(): void {
    if (this.colMenuOpen()) this.colMenuOpen.set(false);
  }
  /** Close the column menu when a click lands outside it. */
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.colMenuOpen()) return;
    const wrap = this.host.nativeElement.querySelector('.rp-dt__colmenu-wrap');
    if (wrap && !wrap.contains(event.target as Node)) this.closeColMenu();
  }
  protected toggleColumn(key: string): void {
    const next = new Set(this.hidden());
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.hidden.set(next);
  }

  /** aria-sort value for a column header. */
  protected ariaSort(col: RpColumnDef<T>): 'ascending' | 'descending' | 'none' | null {
    if (!col.sortable) return null;
    const m = this.sortMeta(col);
    if (!m.active) return 'none';
    return m.asc ? 'ascending' : 'descending';
  }
  protected moveColumn(key: string, dir: -1 | 1): void {
    const keys = this.orderedAllColumns().map((c) => c.key);
    const i = keys.indexOf(key);
    const j = i + dir;
    if (j < 0 || j >= keys.length) return;
    [keys[i], keys[j]] = [keys[j], keys[i]];
    this.order.set(keys);
  }

  private resizeState: { key: string; startX: number; startW: number } | null = null;
  protected startResize(col: RpColumnDef<T>, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    const th = (event.target as HTMLElement).closest('th') as HTMLElement | null;
    if (!th) return;
    this.resizeState = { key: col.key, startX: event.clientX, startW: th.offsetWidth };
    window.addEventListener('mousemove', this.onResizeMove);
    window.addEventListener('mouseup', this.onResizeEnd);
  }
  private readonly onResizeMove = (event: MouseEvent): void => {
    const state = this.resizeState;
    if (!state) return;
    const w = Math.max(60, state.startW + (event.clientX - state.startX));
    this.colWidths.update((m) => ({ ...m, [state.key]: w + 'px' }));
  };
  private readonly onResizeEnd = (): void => {
    this.resizeState = null;
    window.removeEventListener('mousemove', this.onResizeMove);
    window.removeEventListener('mouseup', this.onResizeEnd);
  };

  protected exportCsv(): void {
    const cols = this.visibleColumns();
    const data = this.mode() === 'server' ? this.rows() : this.filtered();
    const lines = [cols.map((c) => this.csvCell(c.header)).join(',')];
    for (const row of data) {
      lines.push(cols.map((c) => this.csvCell(this.cellValue(row, c))).join(','));
    }
    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (this.exportFilename() || 'export') + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  private csvCell(value: string): string {
    const s = String(value ?? '');
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.page.set(1);
    this.emit();
  }

  /** Plain click = single-column sort; Shift+click = add to multi-sort. */
  protected toggleSort(col: RpColumnDef<T>, event?: MouseEvent): void {
    const multi = !!event?.shiftKey;
    const cur = this.sort();
    const existing = cur.find((s) => s.key === col.key);
    let next: RpSort[];
    if (!multi) {
      if (!existing) next = [{ key: col.key, dir: 'asc' }];
      else if (existing.dir === 'asc') next = [{ key: col.key, dir: 'desc' }];
      else next = [];
    } else if (!existing) {
      next = [...cur, { key: col.key, dir: 'asc' }];
    } else if (existing.dir === 'asc') {
      next = cur.map((s) => (s.key === col.key ? { key: s.key, dir: 'desc' } : s));
    } else {
      next = cur.filter((s) => s.key !== col.key);
    }
    this.sort.set(next);
    this.emit();
  }

  protected onFilter(key: string, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    this.filters.update((f) => ({ ...f, [key]: value }));
    this.page.set(1);
    this.emit();
  }

  protected goPage(p: number): void {
    this.page.set(Math.max(1, Math.min(p, this.totalPages())));
    this.emit();
  }

  protected changePageSize(event: Event): void {
    this.pageSize.set(Number((event.target as HTMLSelectElement).value));
    this.page.set(1);
    this.emit();
  }

  private emit(): void {
    this.queryChange.emit({
      search: this.search(),
      sort: this.sort(),
      filters: this.filters(),
      page: this.page(),
      pageSize: this.pageSize(),
    });
  }
}

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RpDataTable } from './rp-data-table';
import { RpRowDetailDef } from './rp-row-detail.directive';
import { RpColumnDef } from './rp-data-table.types';

type Row = Record<string, unknown>;

const columns: RpColumnDef<Row>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'amount', header: 'Amount', sortable: true, align: 'right' },
  { key: 'created', header: 'Created', sortable: true },
  { key: 'city', header: 'City' },
];

/** amount/created/name deliberately give three *distinct* sort orderings. */
const rows: Row[] = [
  { id: 1, name: 'Item 10', amount: 50, created: new Date('2023-01-01'), city: 'Kuala Lumpur' },
  { id: 2, name: 'Item 2', amount: 999, created: new Date('2021-01-01'), city: 'Penang' },
  { id: 3, name: 'Item 1', amount: 200, created: new Date('2022-01-01'), city: 'Ipoh' },
];

describe('RpDataTable', () => {
  let fixture: ComponentFixture<RpDataTable<Row>>;
  let el: HTMLElement;

  function setup(extra: Record<string, unknown> = {}): void {
    fixture = TestBed.createComponent(RpDataTable<Row>);
    el = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('rows', rows);
    for (const [k, v] of Object.entries(extra)) fixture.componentRef.setInput(k, v);
    fixture.detectChanges();
  }

  /** Visible values in a column, top to bottom (body rows only). */
  function colValues(header: string): string[] {
    return Array.from(el.querySelectorAll(`td[data-label="${header}"]`)).map((td) =>
      (td.textContent ?? '').trim()
    );
  }

  function headerButton(label: string): HTMLButtonElement {
    const btn = Array.from(
      el.querySelectorAll<HTMLButtonElement>('.rp-dt__th-btn')
    ).find((b) => (b.textContent ?? '').trim().startsWith(label));
    if (!btn) throw new Error(`No sortable header button for "${label}"`);
    return btn;
  }

  function bodyCheckboxes(): HTMLInputElement[] {
    return Array.from(el.querySelectorAll<HTMLInputElement>('tbody .rp-dt__check-col input'));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  describe('sorting', () => {
    it('sorts numbers numerically (not lexically)', () => {
      setup();
      headerButton('Amount').click();
      fixture.detectChanges();
      expect(colValues('Amount')).toEqual(['50', '200', '999']);
    });

    it('toggles ascending -> descending -> unsorted on repeated clicks', () => {
      setup();
      const btn = headerButton('Amount');

      btn.click();
      fixture.detectChanges();
      expect(colValues('Amount')).toEqual(['50', '200', '999']);

      btn.click();
      fixture.detectChanges();
      expect(colValues('Amount')).toEqual(['999', '200', '50']);

      btn.click();
      fixture.detectChanges();
      expect(colValues('Amount')).toEqual(['50', '999', '200']); // back to input order
    });

    it('sorts strings with natural numeric collation ("Item 2" < "Item 10")', () => {
      setup();
      headerButton('Name').click();
      fixture.detectChanges();
      expect(colValues('Name')).toEqual(['Item 1', 'Item 2', 'Item 10']);
    });

    it('sorts Date values chronologically', () => {
      setup();
      headerButton('Created').click();
      fixture.detectChanges();
      // created asc => ids 2,3,1 => amounts 999,200,50
      expect(colValues('Amount')).toEqual(['999', '200', '50']);
    });

    it('exposes sort state via aria-sort', () => {
      setup();
      const amountTh = headerButton('Amount').closest('th') as HTMLElement;
      expect(amountTh.getAttribute('aria-sort')).toBe('none');

      headerButton('Amount').click();
      fixture.detectChanges();
      expect(amountTh.getAttribute('aria-sort')).toBe('ascending');

      headerButton('Amount').click();
      fixture.detectChanges();
      expect(amountTh.getAttribute('aria-sort')).toBe('descending');
    });
  });

  describe('searching', () => {
    function search(term: string): void {
      const input = el.querySelector('.rp-dt__search input') as HTMLInputElement;
      input.value = term;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }

    it('filters across visible columns', () => {
      setup();
      search('Item 1');
      // "Item 1" and "Item 10" both contain the substring
      expect(colValues('Name')).toEqual(['Item 10', 'Item 1']);
    });

    it('still searches a column after it has been hidden', () => {
      setup({ columnManager: true });

      // open the column manager and hide "City"
      (el.querySelector('.rp-dt__toolbtn') as HTMLButtonElement).click();
      fixture.detectChanges();
      const cityToggle = Array.from(
        el.querySelectorAll<HTMLInputElement>('.rp-dt__colmenu-item input')
      ).find((i) => (i.closest('.rp-dt__colmenu-item')?.textContent ?? '').includes('City'));
      if (!cityToggle) throw new Error('city column toggle not found');
      cityToggle.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(el.querySelector('td[data-label="City"]')).toBeNull(); // column gone

      // a value that only exists in the now-hidden City column still matches
      search('Penang');
      expect(colValues('Name')).toEqual(['Item 2']);
    });
  });

  describe('selection by rowId', () => {
    it('keeps a row selected after the data array is replaced', () => {
      const selections: Row[][] = [];
      setup({ selectable: true, rowId: (r: Row) => r['id'] as number });
      fixture.componentInstance.selectionChange.subscribe((s) => selections.push(s));

      // select the first row (id: 1)
      const first = bodyCheckboxes()[0];
      first.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      const last = selections[selections.length - 1];
      expect(last).toHaveLength(1);
      expect((last[0] as Row)['id']).toBe(1);

      // server refetch: brand-new objects, same ids, different order
      fixture.componentRef.setInput('rows', [
        { id: 3, name: 'Item 1', amount: 200, created: new Date('2022-01-01'), city: 'Ipoh' },
        { id: 1, name: 'Item 10', amount: 50, created: new Date('2023-01-01'), city: 'Kuala Lumpur' },
      ]);
      fixture.detectChanges();

      // the checkbox for id:1 (now the 2nd row) must still be checked
      const checked = bodyCheckboxes().map((c) => c.checked);
      expect(checked).toEqual([false, true]);
    });
  });

  describe('pagination', () => {
    const many: Row[] = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      name: `Row ${i + 1}`,
      amount: i,
      created: new Date(2020, 0, i + 1),
      city: 'X',
    }));

    it('pages rows and reports the visible range', () => {
      setup();
      fixture.componentRef.setInput('rows', many);
      fixture.detectChanges();

      expect(el.querySelectorAll('tbody tr.rp-dt__row')).toHaveLength(10);
      expect((el.querySelector('.rp-dt__range') as HTMLElement).textContent?.trim()).toBe(
        '1–10 of 12'
      );

      (el.querySelector('.rp-dt__pager button[aria-label="Next page"]') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(el.querySelectorAll('tbody tr.rp-dt__row')).toHaveLength(2);
      expect((el.querySelector('.rp-dt__range') as HTMLElement).textContent?.trim()).toBe(
        '11–12 of 12'
      );
    });
  });

  describe('badge column', () => {
    it('renders a type:badge column as toned status pills', () => {
      fixture = TestBed.createComponent(RpDataTable<Row>);
      el = fixture.nativeElement as HTMLElement;
      fixture.componentRef.setInput('columns', [
        { key: 'name', header: 'Name' },
        { key: 'status', header: 'Status', type: 'badge' },
      ]);
      fixture.componentRef.setInput('rows', [
        { id: 1, name: 'A', status: 'Active' },
        { id: 2, name: 'B', status: 'Terminated' },
        { id: 3, name: 'C', status: 'Mystery' },
      ]);
      fixture.detectChanges();

      const cells = el.querySelectorAll('td[data-label="Status"]');
      // built-in map: active -> success, terminated -> danger, unknown -> neutral
      expect(cells[0].querySelector('.rp-tag--success')).toBeTruthy();
      expect(cells[0].querySelector('.rp-tag--dot')).toBeTruthy();
      expect(cells[1].querySelector('.rp-tag--danger')).toBeTruthy();
      expect(cells[2].querySelector('.rp-tag--neutral')).toBeTruthy();
      expect((cells[0].textContent ?? '').trim()).toBe('Active');
    });

    it('honours a custom badgeTone override', () => {
      fixture = TestBed.createComponent(RpDataTable<Row>);
      el = fixture.nativeElement as HTMLElement;
      fixture.componentRef.setInput('columns', [
        { key: 'name', header: 'Name' },
        { key: 'status', header: 'Status', type: 'badge', badgeTone: () => 'brand' },
      ]);
      fixture.componentRef.setInput('rows', [{ id: 1, name: 'A', status: 'Active' }]);
      fixture.detectChanges();

      const cell = el.querySelector('td[data-label="Status"]');
      expect(cell?.querySelector('.rp-tag--brand')).toBeTruthy();
    });
  });
});

@Component({
  imports: [RpDataTable, RpRowDetailDef],
  template: `
    <rp-data-table [columns]="cols" [rows]="data" [rowId]="id" [expandable]="true">
      <ng-template rpRowDetail let-row>
        <div class="detail-content">Detail for {{ row.name }}</div>
      </ng-template>
    </rp-data-table>
  `,
})
class DetailHost {
  readonly cols: RpColumnDef<Row>[] = [{ key: 'name', header: 'Name' }];
  readonly data: Row[] = [{ id: 1, name: 'Ahmad' }];
  readonly id = (r: Row) => r['id'] as number;
}

describe('RpDataTable row detail', () => {
  it('frames projected rpRowDetail content in an inset panel when expanded', () => {
    const fixture = TestBed.createComponent(DetailHost);
    const el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    expect(el.querySelector('.rp-dt__detail-panel')).toBeNull();

    (el.querySelector('.rp-dt__expand') as HTMLButtonElement).click();
    fixture.detectChanges();

    const panel = el.querySelector('.rp-dt__detail-panel');
    expect(panel).toBeTruthy();
    expect(panel?.querySelector('.detail-content')?.textContent).toContain('Ahmad');
  });
});

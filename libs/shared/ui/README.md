# @rp/ui

Shared Angular component library for the RP platform. Contains 50+ standalone components covering forms, navigation, data display, overlays, and data visualisation — all built on `@rp/design` tokens.

---

## Browse components (Storybook)

> **http://storybook.yourcompany.com** *(update this URL once your server is live)*

Every component has live interactive examples, all input controls, and an auto-generated API reference. Run it locally with:

```bash
cd rp-projects/rp-platform
npm install && npm run tokens
npx nx run ui:storybook   # → http://localhost:4400
```

---

## Installation

Already listed as a dependency in `rp-admin` and `rp-partner`. For a new app:

```bash
npm install @rp/ui
```

Then add the theme CSS to your app's `project.json` styles array:

```json
"styles": [
  "node_modules/@rp/design/styles/theme.css",
  "src/styles.css"
]
```

---

## Usage

All components are Angular **standalone** — import directly into your component's `imports` array, no NgModule needed.

```ts
import { RpButton, RpInput, RpFormField } from '@rp/ui';

@Component({
  imports: [RpButton, RpInput, RpFormField],
  template: `
    <rp-form-field label="Email">
      <rp-input type="email" [(ngModel)]="email" />
    </rp-form-field>
    <rp-button variant="primary" (click)="submit()">Submit</rp-button>
  `
})
export class MyComponent { }
```

---

## Conventions

- **Selector prefix:** all components use `rp-` (`rp-button`, `rp-input`, etc.)
- **Inputs:** Angular signal inputs — bind with `[property]="value"`
- **No NgModules:** every export is a standalone component, directive, or service
- **Theming:** component styles use CSS variables from `@rp/design` and respond to light/dark automatically

---

## Component catalogue

### Primitives
| Component | Selector | Description |
|---|---|---|
| `RpButton` | `rp-button` | Variants: `primary` `secondary` `ghost` `danger`. Sizes: `sm` `md` `lg`. Supports `[loading]` and `[disabled]` |
| `RpIcon` | `rp-icon` | Icon renderer |
| `RpIconButton` | `rp-icon-button` | Icon-only button |
| `RpSpinner` | `rp-spinner` | Loading spinner |
| `RpSkeleton` | `rp-skeleton` | Skeleton placeholder for loading states |
| `RpAvatar` | `rp-avatar` | User avatar — image or initials fallback |
| `RpChip` | `rp-chip` | Chip / pill label |
| `RpTag` | `rp-tag` | Coloured tag |
| `RpBadge` | `rp-badge` | Notification badge count |
| `RpDivider` | `rp-divider` | Horizontal or vertical divider |

### Forms
| Component | Selector | Description |
|---|---|---|
| `RpFormField` | `rp-form-field` | Wraps any input with a label, hint, and error message |
| `RpInput` | `rp-input` | Text input — works with `ngModel` and reactive forms |
| `RpTextarea` | `rp-textarea` | Multi-line text input |
| `RpSelect` | `rp-select` | Dropdown select |
| `RpCombobox` | `rp-combobox` | Searchable select / autocomplete |
| `RpCheckbox` | `rp-checkbox` | Checkbox with label |
| `RpSwitch` | `rp-switch` | Toggle switch |
| `RpRadioGroup` | `rp-radio-group` | Radio button group |
| `RpSegmentedControl` | `rp-segmented-control` | Segmented button group |
| `RpOptionCard` | `rp-option-card` | Card-style radio option |
| `RpMoneyInput` | `rp-money-input` | Currency input with live formatting |
| `RpNumberStepper` | `rp-number-stepper` | Increment / decrement number input |
| `RpPhoneInput` | `rp-phone-input` | Phone number input with country code picker |
| `RpDatepicker` | `rp-datepicker` | Single date picker |
| `RpDateRangePicker` | `rp-date-range-picker` | Date range picker |
| `RpOtpInput` | `rp-otp-input` | OTP / PIN code input |
| `RpPasswordInput` | `rp-password-input` | Password input with show / hide toggle |
| `RpSearchInput` | `rp-search-input` | Search input with clear button |
| `RpFileUpload` | `rp-file-upload` | File upload with drag-and-drop |

### Data display
| Component | Selector | Description |
|---|---|---|
| `RpCard` | `rp-card` | Container card |
| `RpStatCard` | `rp-stat-card` | KPI / stat summary card |
| `RpEmptyState` | `rp-empty-state` | Empty state with icon and message |
| `RpProgress` | `rp-progress` | Progress bar |
| `RpAlert` | `rp-alert` | Inline alert / banner |
| `RpDescriptionList` | `rp-description-list` | Key-value description list |
| `RpTimeline` | `rp-timeline` | Vertical event timeline |
| `RpChart` | `rp-chart` | ECharts wrapper for data visualisation |
| `RpQrCode` | `rp-qr-code` | QR code renderer |

### Data table

```ts
import { RpDataTable, RpCellDefDirective, RpRowDetailDirective } from '@rp/ui';
```

```html
<rp-data-table [data]="merchants" [columns]="cols">
  <!-- custom cell template for the "status" column -->
  <ng-template rpCellDef="status" let-row>
    <rp-tag>{{ row.status }}</rp-tag>
  </ng-template>

  <!-- expandable row detail -->
  <ng-template rpRowDetail let-row>
    <p>{{ row.name }} — {{ row.email }}</p>
  </ng-template>
</rp-data-table>
```

| Export | Description |
|---|---|
| `RpDataTable` | Table with sorting, pagination, and row expansion |
| `RpCellDefDirective` | `*rpCellDef="'colKey'"` — custom cell template per column |
| `RpRowDetailDirective` | `*rpRowDetail` — expandable row detail template |

### Navigation & layout
| Component | Selector | Description |
|---|---|---|
| `RpPageHeader` | `rp-page-header` | Page title + breadcrumb + action slot |
| `RpBreadcrumb` | `rp-breadcrumb` | Breadcrumb trail |
| `RpTabs` | `rp-tabs` | Tab bar |
| `RpSidebar` | `rp-sidebar` | Side navigation with permission-aware item filtering |
| `RpTopbar` | `rp-topbar` | Top application bar |
| `RpStepper` | `rp-stepper` | Multi-step wizard stepper |
| `RpAccordion` | `rp-accordion` | Collapsible accordion |
| `RpPagination` | `rp-pagination` | Page number pagination control |
| `RpBottomNav` | `rp-bottom-nav` | Mobile bottom navigation bar |
| `RpNavDrawer` | `rp-nav-drawer` | Mobile slide-out nav drawer |

### Overlays
| Export | Description |
|---|---|
| `RpTooltipDirective` | `rpTooltip="text"` — attach a tooltip to any element |
| `RpMenu` + `RpMenuTriggerDirective` | Context / dropdown menu |
| `RpPopover` | Rich popover panel |
| `RpDrawer` | Side drawer / panel |

### Services
| Service | Description |
|---|---|
| `RpToastService` | Show toast notifications imperatively |
| `RpDialogService` | Open modal dialogs — returns an `RpDialogRef` |

```ts
import { RpToastService, RpDialogService } from '@rp/ui';

// toast
this.toast.show({ message: 'Saved successfully', type: 'success' });

// dialog
const ref = this.dialog.open(ConfirmDialogComponent, { data: { id } });
ref.afterClosed().subscribe(result => { ... });
```

### Presets
Pre-configured objects for common platform patterns.

| Export | Description |
|---|---|
| `adminNavItems` | Navigation tree for the admin portal sidebar |
| `merchantWizardSteps` | Step configuration for the merchant onboarding wizard |

---

## Running tests

```bash
npx nx test ui
```

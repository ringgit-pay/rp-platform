# @rp/util

Pure TypeScript utilities for the RP platform. No Angular dependencies — usable in components, services, Node scripts, or tests.

Covers: money formatting, currency unit conversion, number formatting, and date formatting. All helpers default to Malaysian locale (`en-MY`) and currency (`MYR`).

---

## Installation

Already listed as a dependency in `rp-admin` and `rp-partner`. For a new app:

```bash
npm install @rp/util
```

---

## Money

### `formatMoney(value, options?)`

Format a monetary amount as a localized currency string.

```ts
import { formatMoney } from '@rp/util';

formatMoney(1234.5)                              // "RM 1,234.50"
formatMoney(1234.5, { currency: 'USD', locale: 'en-US' })  // "$1,234.50"
formatMoney(123450, { minor: true })             // "RM 1,234.50"  (from cents)
formatMoney(null)                                // ""
formatMoney(NaN)                                 // ""
```

| Option | Type | Default | Description |
|---|---|---|---|
| `currency` | `string` | `'MYR'` | ISO 4217 currency code |
| `locale` | `string` | `'en-MY'` | BCP-47 locale |
| `display` | `'symbol' \| 'code' \| 'name'` | `'symbol'` | How to render the currency (`RM`, `MYR`, `Malaysian ringgit`) |
| `minor` | `boolean` | `false` | Treat value as integer minor units (cents) |

> Payment systems store amounts as **integer minor units** (e.g. `123450` = RM 1,234.50) to avoid floating-point bugs. Use `{ minor: true }` when reading values from the API/database.

---

### `minorToMajor(minor, currency?, locale?)`

Convert integer minor units to a major-unit decimal.

```ts
import { minorToMajor } from '@rp/util';

minorToMajor(123450)          // 1234.50  (MYR — 2 decimal places)
minorToMajor(12345, 'JPY')    // 12345    (JPY — 0 decimal places)
```

---

### `majorToMinor(major, currency?, locale?)`

Convert a major-unit decimal to integer minor units. Use this before sending amounts to the API.

```ts
import { majorToMinor } from '@rp/util';

majorToMinor(1234.50)         // 123450
majorToMinor(1234.50, 'USD')  // 123450
```

---

### `minorUnitDigits(currency?, locale?)`

Returns the number of minor-unit decimal places for a currency.

```ts
import { minorUnitDigits } from '@rp/util';

minorUnitDigits('MYR')  // 2
minorUnitDigits('JPY')  // 0
minorUnitDigits('KWD')  // 3
```

---

### Constants

```ts
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@rp/util';

DEFAULT_CURRENCY  // 'MYR'
DEFAULT_LOCALE    // 'en-MY'
```

---

## Number formatting

### `formatNumber(value, options?)`

Format a number with locale-aware grouping separators.

```ts
import { formatNumber } from '@rp/util';

formatNumber(1234567)                        // "1,234,567"
formatNumber(0.253, { percent: true })       // "25%"
formatNumber(1234.5, { minimumFractionDigits: 2 })  // "1,234.50"
formatNumber(null)                           // ""
```

| Option | Type | Default | Description |
|---|---|---|---|
| `locale` | `string` | `'en-MY'` | BCP-47 locale |
| `percent` | `boolean` | `false` | Format as percentage (`0.25` → `"25%"`) |
| `minimumFractionDigits` | `number` | — | Minimum decimal places |
| `maximumFractionDigits` | `number` | — | Maximum decimal places |

---

## Date formatting

### `formatDate(value, options?)`

Format a date, ISO string, or timestamp. Returns `""` for null or invalid input.

```ts
import { formatDate } from '@rp/util';

formatDate('2024-01-15')                         // "15 Jan 2024"
formatDate(new Date(), { dateStyle: 'long' })    // "15 January 2024"
formatDate('2024-01-15', { dateStyle: 'short' }) // "15/01/2024"
formatDate('2024-01-15T10:30:00', {
  dateStyle: 'medium',
  timeStyle: 'short'
})                                               // "15 Jan 2024, 10:30 am"
formatDate(null)                                 // ""
formatDate('not-a-date')                         // ""
```

Accepts any value supported by `new Date()`:
- ISO string: `'2024-01-15'` or `'2024-01-15T10:30:00Z'`
- `Date` object
- Unix timestamp (number)

Options extend `Intl.DateTimeFormatOptions` — see [MDN reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat).

---

## Angular pipe — `RpMoneyPipe`

Use `rpMoney` directly in templates. Import `RpMoneyPipe` into your component's `imports` array.

```ts
import { RpMoneyPipe } from '@rp/util';

@Component({
  imports: [RpMoneyPipe],
  template: `
    <span>{{ invoice.total | rpMoney }}</span>
    <span>{{ amountCents | rpMoney: { minor: true } }}</span>
    <span>{{ usdAmount | rpMoney: { currency: 'USD', locale: 'en-US' } }}</span>
  `
})
export class InvoiceCard { }
```

---

## Running tests

```bash
npx nx test util
```

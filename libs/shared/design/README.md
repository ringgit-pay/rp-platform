# @rp/design

Design system foundation for the RP platform. Provides design tokens (CSS variables), a Tailwind CSS preset, and an Angular `ThemeService` for light/dark mode and white-label brand overrides.

---

## What's inside

```
libs/shared/design/
├── src/
│   ├── styles/
│   │   ├── primitives.css   ← raw colour palette & base scale (generated)
│   │   └── theme.css        ← semantic tokens (--rp-brand, --rp-surface …)
│   └── lib/theme/
│       ├── theme.service.ts ← Angular service: light/dark + brand override
│       └── theme.types.ts   ← ThemeMode, BrandOverride types
└── tailwind-preset.js       ← Tailwind preset — extends config with rp-* utilities
```

---

## Setup in an app

### 1. Add the theme CSS globally

In your app's `project.json` styles array (before your own `styles.css`):

```json
"styles": [
  "node_modules/@rp/design/styles/theme.css",
  "src/styles.css"
]
```

This loads all CSS variables onto `<html>`. Without it, all `@rp/ui` components will render without colours.

### 2. Add the Tailwind preset (optional — only if using Tailwind in your app)

```js
// tailwind.config.js
const rpPreset = require('@rp/design/tailwind-preset');

module.exports = {
  presets: [rpPreset],
  content: ['./src/**/*.{html,ts}'],
};
```

---

## Design tokens reference

All tokens are CSS custom properties on `:root`. Use them in your own component styles with `var(--token-name)`.

### Brand / primary colour
| Token | Usage |
|---|---|
| `--rp-brand` | Primary brand colour (buttons, links, focus rings) |
| `--rp-brand-hover` | Brand hover / active state |
| `--rp-text-on-brand` | Text colour on brand-coloured backgrounds |

### Surfaces & backgrounds
| Token | Usage |
|---|---|
| `--rp-bg` | Page background |
| `--rp-surface` | Card / panel background |
| `--rp-surface-sunken` | Recessed surface (table rows, input backgrounds) |
| `--rp-surface-raised` | Elevated surface (dropdowns, popovers) |

### Text
| Token | Usage |
|---|---|
| `--rp-text` | Primary body text |
| `--rp-text-subtle` | Secondary / muted text |
| `--rp-text-disabled` | Disabled text |

### Borders
| Token | Usage |
|---|---|
| `--rp-border` | Default border |
| `--rp-border-strong` | Emphasized border |

### Semantic / status
| Token | Usage |
|---|---|
| `--rp-danger` | Error / destructive actions |
| `--rp-success` | Success states |
| `--rp-warning` | Warning states |
| `--rp-info` | Informational states |

### Typography
| Token | Usage |
|---|---|
| `--rp-font-family-sans` | Primary font family |
| `--rp-font-size-sm` | Small text (12px) |
| `--rp-font-size-base` | Base text (14px) |
| `--rp-font-size-lg` | Large text (16px) |
| `--rp-font-weight-medium` | Medium weight (500) |
| `--rp-font-weight-semibold` | Semibold weight (600) |

### Radius
| Token | Usage |
|---|---|
| `--rp-radius-sm` | Small radius (inputs, chips) |
| `--rp-radius-md` | Medium radius (buttons, cards) |
| `--rp-radius-lg` | Large radius (modals, drawers) |

### Example usage in your own component
```css
.my-custom-panel {
  background: var(--rp-surface);
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  color: var(--rp-text);
}
```

---

## ThemeService

Inject `ThemeService` to control light/dark mode and apply tenant brand overrides at runtime.

```ts
import { ThemeService } from '@rp/design';

@Component({ ... })
export class AppShell {
  private theme = inject(ThemeService);

  readonly isDark = this.theme.isDark; // Signal<boolean>

  toggleTheme() {
    this.theme.toggle();
  }

  setDark() {
    this.theme.setMode('dark');
  }
}
```

```html
<rp-icon-button (click)="toggleTheme()">
  {{ isDark() ? 'light_mode' : 'dark_mode' }}
</rp-icon-button>
```

### White-label brand override (per-tenant)

Apply a tenant's primary colour at runtime without rebuilding:

```ts
// on login / tenant resolution
this.theme.applyBrand({
  brand: '#0062ff',       // maps to --rp-brand
  brandHover: '#0050d0',  // maps to --rp-brand-hover
});

// revert to default design system brand
this.theme.clearBrand();
```

### How it works

`ThemeService` sets a `data-theme="light|dark"` attribute on `<html>`. The `theme.css` file contains two blocks of CSS variable definitions scoped to `[data-theme="light"]` and `[data-theme="dark"]` — the browser switches them automatically.

The chosen mode is **persisted in `localStorage`** and **respects the OS preference** (`prefers-color-scheme`) on first load.

---

## Rebuilding design tokens

Tokens are generated from source via `style-dictionary`. Run this whenever token source files change:

```bash
cd rp-projects/rp-platform
npm run tokens
# regenerates: libs/shared/design/src/styles/primitives.css
#              libs/shared/design/src/styles/theme.css
```

Always run `npm run tokens` before `npm run build`.

---

## Running tests

```bash
npx nx test design
```

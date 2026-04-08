---
name: audit-styles
description: Scan all component scss files for hardcoded values that should use design tokens from variables.scss. Use when doing a style cleanup or before a design system review.
---

Scan `apps/web/src` for style violations — hardcoded values that should reference tokens from `apps/web/src/styles/variables.scss`.

$ARGUMENTS can scope the audit to a specific file or folder (e.g. `apps/web/src/components/atoms/button`). If not provided, scan the entire `apps/web/src` directory.

## Steps

### 1. Read the token files

Read `apps/web/src/styles/variables.scss` and `apps/web/src/styles/mixins.scss` to build the list of available tokens and mixins.

### 2. Scan for violations

Check all `*.module.scss` files (and `globals.scss`) for:

**Hardcoded colors** — hex, rgb, rgba, or named colors that match or approximate an existing token:

```bash
grep -rn "#[0-9a-fA-F]\{3,6\}\|rgb(\|rgba(" apps/web/src --include="*.scss"
```

**Hardcoded font sizes** — `font-size` declarations using raw rem/px values that match a `$fs-*` token:

```bash
grep -rn "font-size:" apps/web/src --include="*.scss"
```

**`color: red` / `color: blue`** — named CSS colors used for errors or states:

```bash
grep -rn "color: red\|color: blue\|color: green" apps/web/src --include="*.scss"
```

**Repeated patterns** — 3+ identical property:value blocks that could be a mixin (check for repeated `display: flex; align-items: center`, border-radius, box-shadow, etc.)

### 3. Cross-reference against known tokens

For each hardcoded value found, check if a matching token exists in `variables.scss`:

| Found                                         | Should be              |
| --------------------------------------------- | ---------------------- |
| `#1a1a1a`                                     | `$ink`                 |
| `#ffffff`                                     | `$white`               |
| `rgb(0, 0, 0)`                                | `$black`               |
| `rgba(0,0,0,0.5)`                             | `$ink-muted-50`        |
| `font-size: 1.6rem`                           | `$fs-1-6`              |
| `border: 1px solid #000; border-radius: 1rem` | `@include border`      |
| `box-shadow: ...`                             | `@include shadow(...)` |

### 4. Report violations

Group findings by file. For each violation:

```
apps/web/src/components/atoms/button/button.module.scss
  line 98  color: #4d4d4d          → no token exists (candidate for $disabled-bg)
  line 99  color: red              → no token exists (candidate for $color-error)
  line 27  font-size: 1.6rem       → use $fs-1-6
```

Severity:

- **token exists** — straightforward fix, just swap the value
- **no token yet** — suggest a name for a new token via `/add-scss-var`
- **mixin candidate** — repeated pattern that should be extracted via `/add-mixin`

### 5. Summary

End with a count:

```
Found X violations across Y files:
  - A with existing tokens (easy fixes)
  - B with no token (need /add-scss-var first)
  - C mixin candidates (need /add-mixin first)
```

Do **not** auto-fix — report only, unless the user explicitly asks to fix specific violations.

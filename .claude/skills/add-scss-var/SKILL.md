---
name: add-scss-var
description: Add a new design token (color, font size, spacing, or layout value) to variables.scss. Use when a new reusable value is needed instead of hardcoding it in a component stylesheet.
---

Add a new design token to `apps/web/src/styles/variables.scss`.

$ARGUMENTS may contain the variable name and value (e.g. `$border-radius-sm 0.4rem`). If not provided, ask the user:

1. What is the variable name? (kebab-case with `$` prefix, e.g. `$spacing-xs`)
2. What is the value?
3. Which group does it belong to? (colors, borders, font sizes, layout, fonts, or a new group)

## Steps

### 1. Read the current variables file

Read `apps/web/src/styles/variables.scss` to understand existing groups and naming conventions.

### 2. Choose the right group

Place the variable in the correct section:

- **Colors** — `$canvas-*`, `$ink`, `$black`, `$white`, `$black-*`
- **Borders** — `$border-subtle`, `$border-strong`, `$border-medium`
- **Font sizes** — `$fs-*` (numeric suffix = rem value, e.g. `$fs-1-6` = 1.6rem)
- **Fonts** — `$font-display`, `$font-sans`
- **Layout/heights** — `$navbarHeight`, `$maxWidth`, `$header-height-*`, `$stepper-*`

If it belongs to none of the above, create a new group with a comment header.

### 3. Naming conventions

- Colors: `$canvas-{descriptor}` or `$ink-{modifier}` — match existing palette naming
- Font sizes: `$fs-{rem-value}` (replace `.` with `-`, e.g. `1.25rem` → `$fs-1-25`)
- Spacing/layout: descriptive kebab-case, e.g. `$card-padding`, `$modal-max-width`
- Opacity variants: use rgba inline in the variable value (e.g. `rgba($black, 0.15)`)

### 4. Insert the variable

Add it in the correct group, maintaining the existing order within that group (usually ascending for numeric values, or alphabetical for descriptive ones).

### 5. Check for existing hardcoded values

After adding, search the codebase for the hardcoded equivalent of this value:

```bash
grep -r "<value>" apps/web/src --include="*.scss"
```

If found, list the files where the hardcoded value could be replaced with the new variable — but do **not** auto-replace unless the user asks.

### 6. Output

Print:

- The variable added and its group
- Any files found with the equivalent hardcoded value (for the user to clean up)

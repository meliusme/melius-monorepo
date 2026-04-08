---
name: add-component
description: Scaffold a new shared frontend component with its tsx, module.scss, and stories.tsx files. Use when creating a new reusable UI component in apps/web/src/components/.
---

Scaffold a new shared component in `apps/web/src/components/`. The component name and optional atom/molecule type come from $ARGUMENTS (e.g. `badge` or `molecules/card`). If not provided, ask the user for the name and which level it belongs to (`atoms` or `molecules`).

## File structure to create

```
apps/web/src/components/<level>/<name>/
├── <name>.tsx
├── <name>.module.scss
└── <name>.stories.tsx
```

## 1. Component file (`<name>.tsx`)

Follow these conventions exactly:

```tsx
'use client'; // only if the component uses hooks or browser APIs

import styles from './<name>.module.scss';

export interface <Name>Props {
  // required props first, optional last
}

export default function <Name>({ ...props }: <Name>Props) {
  const className = [
    styles.<name>,
    // conditional classes joined the same way as button.tsx
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      {/* content */}
    </div>
  );
}
```

Rules:

- Export the props interface as a named export (`export interface <Name>Props`)
- Default-export the component function
- Use CSS Modules via `styles.*` — no inline styles except dynamic values (e.g. `width`)
- Extend `HTMLAttributes<HTMLDivElement>` (or appropriate element) when the component wraps a native element and should forward standard HTML props
- Add `'use client'` only when hooks (`useState`, `useEffect`, etc.) or browser APIs are used

## 2. Styles file (`<name>.module.scss`)

```scss
@use '../../../styles/variables' as *;
@use '../../../styles/mixins' as *;

.<name > {
  // base styles
}
```

Rules:

- Always import `variables` and `mixins` with `@use ... as *`
- Adjust the relative import path based on the nesting depth of the component
- Use `$variables` from `variables.scss` — never hardcode colors or font sizes that exist as tokens
- Use `@include mixin-name` from `mixins.scss` for borders, shadows, breakpoints
- Class names are camelCase to match CSS Modules references in TSX
- Mobile-first: base styles for mobile, use `@include min-width-md` etc. for larger breakpoints

### Available tokens (key ones)

**Colors:** `$canvas`, `$canvas-dark`, `$canvas-warm`, `$ink`, `$black`, `$white`, `$border-subtle`, `$border-strong`

**Font sizes:** `$fs-1`, `$fs-1-2`, `$fs-1-4`, `$fs-1-5`, `$fs-1-6`, `$fs-1-8`, `$fs-2`, `$fs-2-4`, `$fs-3`

**Fonts:** `$font-display`, `$font-sans`

**Mixins:** `border`, `canvasBorder`, `column`, `shadow($x, $y, $blur, $spread, $opacity)`, `min-width-md`, `min-width-lg`, `max-width-md`, `page-container`

## 3. Story file (`<name>.stories.tsx`)

Follow the conventions in [shared/ladle-story-conventions.md](../shared/ladle-story-conventions.md).

The story file must cover the default state, each variant value, and all meaningful boolean flags of this component.

## 4. After scaffolding

Print a short summary of:

- Files created
- Props defined
- Stories added
- Any tokens or mixins used

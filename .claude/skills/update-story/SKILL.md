---
name: update-story
description: Review and update (or create) the Ladle story file for a modified shared component in apps/web/src/components/. Use when a component's props or variants change and the story needs to stay in sync.
---

When a shared component in `apps/web/src/components/` is modified, review and update (or create) its corresponding `*.stories.tsx` file so the story accurately reflects the current component API.

The component file to work with comes from $ARGUMENTS. If no argument is provided, ask the user which component file was changed.

## Steps

### 1. Read the component

Read the component file. Identify:
- All exported props / interface (look for `interface *Props` or `type *Props`)
- All prop variants (e.g. `variant` union, boolean flags, optional fields)
- The component's default export name

### 2. Find the story file

The story lives alongside the component with the suffix `.stories.tsx`.
Example: `apps/web/src/components/atoms/button/button.tsx` → `apps/web/src/components/atoms/button/button.stories.tsx`

Check whether the story file already exists.

### 3. Decide: update or create

**If the story file exists:**
- Read it.
- Compare its stories against the current prop surface:
  - Stories for props/variants that no longer exist → remove them.
  - New props or variants with no story → add them.
  - Existing stories with stale prop names or values → fix them.
- Keep valid, unchanged stories as-is.

**If the story file does not exist:**
- Create it from scratch covering every meaningful prop combination.

### 4. Story conventions (always follow these)

```tsx
import type { Story } from '@ladle/react';
// import { useState } from 'react' only when the component needs controlled state
import ComponentName from './componentName';

export const StoryName: Story = () => (
  <ComponentName propA="value" propB={true} />
);
```

Rules:
- Import from `@ladle/react` — never `@storybook/react`.
- One named export per story, PascalCase name.
- For required callbacks (`onClick`, `onChange`), use `() => {}` or `() => console.log('clicked')`.
- For controlled inputs, use `useState`.
- Wrap in `<div style={{ padding: '2rem' }}>` when the component needs visual breathing room.
- Cover at minimum:
  - Default / happy-path state
  - Each distinct `variant` value
  - Important boolean flags (`disabled`, `large`, `rounded`, …)
  - Error / edge-case states when the component supports them

### 5. Summary

After editing the story file, print a short summary listing:
- Stories added, removed, or updated
- Any props intentionally left without a story (and why)

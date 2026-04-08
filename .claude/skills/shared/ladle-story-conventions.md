# Ladle Story Conventions

This project uses [Ladle](https://ladle.dev) (not Storybook) for component stories.

## File naming

Story files live alongside the component: `<name>.stories.tsx`

## Imports

```tsx
import type { Story } from '@ladle/react';
// import { useState } from 'react'; — only when controlled state is needed
import <ComponentName> from './<componentName>';
```

Always import from `@ladle/react` — never `@storybook/react`.

## Story structure

```tsx
export const StoryName: Story = () => (
  <div style={{ padding: '2rem' }}>
    <ComponentName propA="value" propB={true} />
  </div>
);
```

- One named export per story, PascalCase name
- Wrap in `<div style={{ padding: '2rem' }}>` when the component needs visual breathing room
- For required callbacks (`onClick`, `onChange`), use `() => {}` or `() => console.log('...')`
- For controlled components (inputs etc.), use `useState`

## Minimum coverage

Every story file must cover:

- Default / happy-path state
- Each distinct `variant` value (if the component has a variant prop)
- Important boolean flags (`disabled`, `large`, `rounded`, …)
- Error / edge-case states when the component supports them

## Story naming guide

| Scenario        | Name                              |
| --------------- | --------------------------------- |
| Default render  | `Default` or `Primary`            |
| Named variant   | `Secondary`, `Tertiary`           |
| Boolean flag on | `Disabled`, `Large`, `Rounded`    |
| Combination     | `LargeRounded`, `RoundedWithIcon` |
| Error state     | `WithError`, `WithMultipleErrors` |
| Size variants   | `SmallSize`, `LargeSize`          |

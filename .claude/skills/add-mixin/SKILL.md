---
name: add-mixin
description: Add a new reusable Sass mixin to mixins.scss. Use when a style pattern appears in 2+ component files and should be extracted into a shared mixin.
---

Add a new mixin to `apps/web/src/styles/mixins.scss`.

$ARGUMENTS may describe the mixin (e.g. `flex-center` or `card-container with padding and border`). If not provided, ask the user:

1. What is the mixin name? (camelCase, e.g. `flexCenter`, `cardContainer`)
2. What CSS properties should it include?
3. Does it need parameters? (e.g. `$gap`, `$radius`)

## Steps

### 1. Read the existing mixins file

Read `apps/web/src/styles/mixins.scss` to understand existing mixins and avoid duplication. Check if a similar mixin already exists that could be extended instead.

### 2. Check for the pattern in the codebase

Search for the style pattern across component scss files to confirm it's actually repeated:

```bash
grep -r "<property>:<value>" apps/web/src --include="*.scss"
```

If it appears in only one place, flag it — a mixin may be premature.

### 3. Write the mixin

Follow the existing style in `mixins.scss`:

```scss
@mixin mixinName($param: defaultValue) {
  property: value;
  another-property: $param;
}
```

Rules:

- camelCase name (matches existing: `border`, `canvasBorder`, `column`, `shadow`, `page-container`)
- Use `$variables` from `variables.scss` where possible — the file already imports it via `@use './variables' as *`
- Add parameters only when the mixin genuinely needs to vary at call sites; avoid over-parameterizing
- Keep mixins focused — one responsibility per mixin
- Place it near semantically related mixins (layout mixins together, visual mixins together)

### 4. Find call sites and update them

After adding the mixin, search for files that have the duplicated pattern:

```bash
grep -rn "<duplicated-property>" apps/web/src --include="*.scss"
```

List the files where `@include mixinName` could replace the duplicated code. Do **not** auto-replace unless the user asks — just report them.

### 5. Output

Print:

- The mixin added with its signature
- Files where the pattern was found (candidates for adoption)

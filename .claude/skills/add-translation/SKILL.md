---
name: add-translation
description: Add a new i18n translation key to both en.json and pl.json message files. Use when adding a new UI string, label, or copy to the frontend.
---

Add a new translation key to the frontend i18n message files.

Translation files live at:

- `apps/web/src/messages/en.json` — English (default locale)
- `apps/web/src/messages/pl.json` — Polish

$ARGUMENTS may contain the namespace, key name, or English value. If not provided, ask the user:

1. Which namespace does this key belong to? (e.g. `Header`, `Home`, `DocCard` — look at existing namespaces in the files)
2. What is the key name? (camelCase)
3. What is the English value?
4. What is the Polish value? (if the user doesn't know, make a best-effort translation and flag it for review)

## Steps

### 1. Read both files

Read `apps/web/src/messages/en.json` and `apps/web/src/messages/pl.json` to understand existing namespaces and avoid duplicates.

### 2. Insert the key

Add the key to the correct namespace in **both** files. Keep the JSON alphabetically sorted within each namespace if other keys in that namespace are alphabetically sorted; otherwise preserve the existing order.

Special value formats to be aware of:

- `{variable}` — interpolated variable (e.g. `"Found {count} results"`)
- `{count, plural, one {# item} other {# items}}` — ICU plural (use in pl.json where Polish pluralization is needed)
- `<em>text</em>` — HTML tags are allowed in values

### 3. Show usage example

After editing, print a short snippet showing how to use the key in a component:

```tsx
const t = useTranslations('<Namespace>');
// ...
<span>{t('<keyName>')}</span>;
```

### 4. Flag for review if needed

If you made a best-effort Polish translation, end with:

> Polish translation is a best-effort — please review before shipping.

---
name: review-pr
description: Review a pull request and leave inline comments via gh CLI. Use when the user wants a code review focused on project conventions, correctness, and potential bugs.
---

Review a pull request for this project. The PR number comes from $ARGUMENTS. If not provided, ask the user for the PR number or URL.

## Steps

### 1. Fetch the PR diff

```bash
gh pr diff <number>
gh pr view <number>
```

Read the full diff carefully before writing any comments.

### 2. Review checklist

Go through the diff with these project-specific lenses:

**Backend (NestJS)**

- [ ] New DTOs have `@ApiProperty()` on every field
- [ ] Protected routes use `@UseGuards(AccessTokenGuard)`
- [ ] Controllers use `@ApiTags()` and `@ApiOperation()`
- [ ] Services inject `PrismaService` via constructor (not module-level)
- [ ] Unit tests exist and Prisma is mocked with `jest.fn()` — never a real DB
- [ ] New error codes are added to `packages/error-codes/` and `pnpm gen:error-codes` was run
- [ ] Events follow the dot-delimiter convention (e.g. `meeting.cancelled`)
- [ ] No raw SQL — use Prisma query API

**Frontend (Next.js)**

- [ ] New UI strings use `useTranslations` — no hardcoded English text
- [ ] Both `en.json` and `pl.json` are updated when new keys are added
- [ ] API calls use the generated types from `apps/web/src/generated/openapi.ts`
- [ ] Server components don't import client-only hooks
- [ ] `'use client'` directive is present where needed

**General**

- [ ] No `console.log` left in production code
- [ ] No commented-out code blocks
- [ ] No `TODO` without a linked issue
- [ ] Logic is correct and edge cases are handled

### 3. Categorize findings

Label each finding:

- **bug** — incorrect behavior or broken logic
- **convention** — deviates from project patterns
- **nitpick** — style or minor improvement (non-blocking)

Skip nitpicks unless there are few other findings — don't bury real issues.

### 4. Leave a review summary

Print a structured summary:

```
## PR #<number> Review

**Verdict:** Approve / Request changes / Comment

### Issues
- [bug] <file>:<line> — <description>
- [convention] <file>:<line> — <description>

### Nitpicks (non-blocking)
- <file>:<line> — <description>

### LGTM
- <what looks good>
```

If there are no issues, approve with a short note on what was checked.

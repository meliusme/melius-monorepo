---
name: pr-create
description: Create a pull request from current changes. Handles branch creation if on main, stages changes, commits, and opens a PR with a short title and bullet-point description.
---

Create a pull request from the current working changes.

## Steps

### 1. Check current branch

```bash
git branch --show-current
```

If on `main`, a new branch must be created before committing.

### 2. Review the diff

```bash
git diff
git diff --cached
git status
```

Read the diff carefully to understand what changed. Do **not** ask the user — derive everything from the diff.

### 3. Derive names from the diff

Based on what changed, produce:
- **Branch name** — kebab-case, max 4-5 words, no ticket numbers. E.g. `add-avatar-size-prop`
- **Commit message** — imperative mood, max 60 chars. E.g. `add size prop to Avatar component`
- **PR title** — same as the commit message

Keep all three short and specific. Avoid generic words like "update", "fix stuff", "changes".

### 4. Create branch if on main

```bash
git checkout -b <branch-name>
```

Skip this step if already on a feature branch.

### 5. Stage and commit

Stage only relevant files — prefer specific paths over `git add .`.

```bash
git add <files>
git commit -m "<commit message>"
```

Never use `--no-verify`.

### 6. Push and open PR

```bash
git push -u origin <branch-name>
```

Then create the PR:

```bash
gh pr create --title "<commit message>" --body "$(cat <<'EOF'
## Changes
- <bullet 1>
- <bullet 2>
- <bullet 3>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

PR body rules:
- Bullets only — no prose paragraphs
- Max 4-5 bullets
- Each bullet one line, specific and factual
- No bullet should repeat the title

### 7. Return the PR URL

Print the PR URL so the user can open it directly.

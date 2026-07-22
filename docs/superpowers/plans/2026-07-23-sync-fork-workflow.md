# Fork Synchronization Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the fork's scheduled/manual synchronization workflow fast-forward `main` from upstream and push with the required repository permission.

**Architecture:** A single GitHub Actions job checks out the fork's `main` branch with complete history, fetches the canonical repository as `upstream`, performs a fast-forward-only merge, and pushes through the checkout-provided `GITHUB_TOKEN`. Command failures remain visible and stop the job.

**Tech Stack:** GitHub Actions YAML, `actions/checkout@v4`, Git

## Global Constraints

- Grant only `contents: write` to the workflow token.
- Never force-push or discard fork history.
- Never suppress Git failures.
- Preserve scheduled and manual triggers.

---

### Task 1: Repair fork synchronization

**Files:**
- Modify: `.github/workflows/sync-fork.yml`

**Interfaces:**
- Consumes: fork repository `main`, `https://github.com/ALOC-dev/5th-project-yulgok-client-2026.git` as upstream
- Produces: a GitHub Actions workflow that fast-forwards and pushes fork `main`

- [ ] **Step 1: Run the pre-change static assertions and verify failure**

Run:

```powershell
$workflow = Get-Content -Raw .github/workflows/sync-fork.yml
if ($workflow -notmatch '(?m)^permissions:\r?$' -or $workflow -notmatch '(?m)^  contents: write\r?$' -or $workflow -notmatch 'actions/checkout@v4' -or $workflow -notmatch 'ref: main' -or $workflow -notmatch 'fetch-depth: 0' -or $workflow -notmatch 'git merge --ff-only upstream/main' -or $workflow -match '\|\| true') { throw 'workflow does not meet the synchronization contract' }
```

Expected: FAIL with `workflow does not meet the synchronization contract`.

- [ ] **Step 2: Replace the workflow with the minimal corrected configuration**

```yaml
name: Sync Fork with Upstream

on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout fork main branch
        uses: actions/checkout@v4
        with:
          ref: main
          fetch-depth: 0

      - name: Configure Git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

      - name: Fetch upstream
        run: |
          git remote add upstream https://github.com/ALOC-dev/5th-project-yulgok-client-2026.git
          git fetch upstream main

      - name: Fast-forward fork main
        run: git merge --ff-only upstream/main

      - name: Push fork main
        run: git push origin main
```

- [ ] **Step 3: Run static assertions and YAML parsing**

Run the Step 1 command again.

Expected: no output and exit code `0`.

Run:

```powershell
ruby -e "require 'yaml'; YAML.load_file('.github/workflows/sync-fork.yml'); puts 'YAML valid'"
```

Expected: `YAML valid`. If Ruby is unavailable, use the repository's installed YAML parser without adding a dependency.

- [ ] **Step 4: Run repository regression verification**

Run:

```powershell
npm run build
```

Expected: exit code `0`.

- [ ] **Step 5: Inspect and commit**

```powershell
git diff --check
git diff -- .github/workflows/sync-fork.yml
git add .github/workflows/sync-fork.yml docs/superpowers/plans/2026-07-23-sync-fork-workflow.md
git commit -m "fix: fork 동기화 workflow 권한 및 오류 처리"
```

Expected: no whitespace errors and one commit containing only the workflow and implementation plan.

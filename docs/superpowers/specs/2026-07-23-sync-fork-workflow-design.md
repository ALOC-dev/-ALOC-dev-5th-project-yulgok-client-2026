# Fork synchronization workflow design

## Problem

The fork synchronization workflow fetches the upstream repository, merges
`upstream/main`, and pushes the result to the fork. The push requires write
access to repository contents, but the workflow does not grant that permission
to `GITHUB_TOKEN`. The merge command also uses `|| true`, which hides merge
failures and lets the job continue to a misleading push failure.

## Design

The workflow will grant only `contents: write` to its job token. Checkout will
use `actions/checkout@v4`, explicitly check out `main`, and fetch full history
so Git can compare the fork and upstream branches reliably.

After adding and fetching the upstream remote, the workflow will run a
fast-forward-only merge from `upstream/main` into the checked-out `main`
branch. It will then push `main` to the fork's `origin`. Fast-forward-only
behavior preserves fork-specific commits and fails clearly if the branches
have diverged; the workflow will never force-push or discard fork history.

## Error handling

No command will suppress a non-zero exit status. A divergent branch, invalid
upstream URL, authentication failure, or rejected push will therefore fail at
the command that identifies the real problem in the Actions log.

## Verification

Static validation will confirm that:

- the workflow grants `contents: write`;
- checkout targets `main` with full history;
- synchronization uses `git merge --ff-only upstream/main`;
- no failure-suppression operator remains;
- the resulting YAML can be parsed successfully.

Repository build/tests will also be run to detect unrelated regressions caused
by the change. The actual scheduled push can only be verified after the updated
workflow is pushed to GitHub and manually dispatched or reaches its schedule.

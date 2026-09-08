---
name: coordinate
description: (Two-repo authors only.) Coordinate a change across the dissertation app and the R package — surface the cross-repo contract, what a change on one side requires on the other, and a safe sequence. Use when a change spans both repos or the analysis ↔ writing boundary. Delegates breadth to the repo-coordinator agent.
---

# coordinate — app ↔ package

Applies only when `source.rPackage` is set in `dataimago-spec.yaml`. Plan and
flag; don't silently edit both repos.

## Steps
1. Read both entry points (this repo's `wiki/`/README; the package's
   `DESCRIPTION`/`NAMESPACE`/`wiki/`).
2. Name the contract: which package functions and outputs the app + thesis consume.
3. For a proposed change, state the cross-repo impact and a sequence (usually
   package first → regenerate/consume in the app → update the thesis claim).
4. Record each fact where it belongs (in its own repo); point across, don't copy.

For breadth, hand off to the `repo-coordinator` agent.

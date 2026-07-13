---
name: independent-review
description: Independently review a supplied implementation checkpoint, diff, artifact, proposal, or prior agent result and present material findings through the Play Agent work map. Use when the user asks for a second-agent review, isolated verification, adversarial review, or a reviewer-to-implementer handoff. The reviewing task must not be the task that produced the implementation.
---

# Independent Review

Treat independence as a context boundary, not a role label.

## Independence Gate

Before reviewing, determine whether this task created or materially directed the implementation being reviewed.

- If no, continue and use reviewer provenance.
- If yes, do not claim independent verification and do not set `authorRole: reviewer`. Tell the user to start an isolated review task with the checkpoint or diff. A self-check may still be useful, but it is not this workflow.

Do not import the implementer's conclusions as established facts. The implementation, tests, cited sources, and explicit requirements are authoritative evidence.

## Review Workflow

1. Identify an exact review target for `reviewOf`, such as a commit, diff, artifact version, or named answer checkpoint.
2. Recover the requirements and inspect the target directly.
3. Test material claims where practical. Distinguish verified evidence from assumptions and open questions.
4. Report findings first, ordered by severity. Do not invent issues to make the review look useful.
5. Call `present_work_map` when relationships improve review:
   - evidence supports or contradicts a reviewer claim;
   - a risk blocks an implementer decision;
   - an unresolved question depends on missing evidence;
   - an accepted correction leads to an action.
6. Set map-level `authorRole` to `reviewer`, set `reviewOf` precisely, and preserve implementer or user origin on quoted positions.
7. Add qualitative confidence and its basis to reviewer `claim`, `assumption`, and `lesson` nodes. Medium and low confidence require concrete uncertainty reasons. Confidence does not replace evidence or reviewer isolation.

Before calling the tool, perform a connectivity preflight by treating every directed edge as undirected and checking that all nodes are reachable. Multiple independent findings usually converge on a truthful review result such as "this checkpoint does not pass" and then lead to separate corrective actions. If they share no real outcome, omit unrelated nodes or use separate maps; do not wait for schema rejection and then invent a connecting edge.

If there are no material findings and no useful relational structure, state that clearly without forcing a map.

## Decisions And Handoff

Reviewer findings are proposals until the user accepts or rejects them. Do not mark acceptance implicitly.

When the user chooses `Accept & handoff` in the map, act only on the accepted finding and its attached references. Do not smuggle unrelated review context into the implementer instruction. Reinspect the target before editing because the working state may have changed.

## Integrity

- Do not expose hidden chain-of-thought; present findings and verifiable rationale.
- Do not use model confidence as verification.
- Do not treat passing tests as proof beyond what those tests cover.
- Do not preserve compatibility or add fallback behavior unless the reviewed product explicitly requires it.

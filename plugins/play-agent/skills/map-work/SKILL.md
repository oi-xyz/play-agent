---
name: map-work
description: Present substantial research, implementation, architecture, product, or review work as a compact Play Agent work map when evidence, assumptions, alternatives, decisions, risks, or next actions have meaningful relationships. Use when the user asks to map or visualize a result, or when relational inspection materially improves a substantial answer. Do not use for simple answers, flat lists, or decorative diagrams.
---

# Map Work

Use the map as a review artifact after doing the work, not as a substitute for the answer.

## Decide Whether To Map

Call `present_work_map` only when the result contains at least one relationship the user benefits from inspecting, such as:

- evidence supporting or contradicting a claim;
- an assumption blocking a decision;
- alternatives that inform a decision;
- a risk and its mitigation;
- a decision leading to concrete actions.

Do not call it for a short answer, a single fact, a flat checklist, or prose that would become no clearer as a graph.

## Build The Graph

1. Finish and verify the substantive work first.
2. Select the smallest useful semantic set. Prefer 4-12 nodes; never exceed the tool limits.
3. Use only the tool's node kinds and directed relations. Titles must state the actual claim, evidence, risk, decision, or action rather than repeat category names.
4. Connect every node into one meaningful graph. Do not invent edges to satisfy connectivity; remove irrelevant nodes instead.
5. Attach inspectable references to evidence and source-sensitive claims. Use `{"path":"src/file.ts","line":42}` for code, `{"label":"Source name","uri":"https://..."}` for links, or `{"label":"Interview","locator":"turn 18"}` for other precise locations. Never fabricate a reference or combine location forms in one reference.
6. Set provenance truthfully:
   - `implementer` when this task performed the implementation;
   - `reviewer` only in a genuinely separate review context;
   - `agent` for ordinary analysis;
   - `user` only for positions supplied by the user.
7. For every `claim`, `assumption`, and `lesson`, set qualitative `confidence` and a concrete `confidenceBasis`. For medium or low confidence, add one to three `uncertaintyReasons` that identify missing evidence, ambiguity, or an unresolved dependency. Do not add confidence fields to other node kinds.
8. Call `present_work_map`. Do not reproduce every node again in prose after the map renders.

Before the call, treat edges as undirected and verify that every node is reachable from the first node. When the result contains separate clusters, connect them only through a real shared decision, review result, or action. If no truthful relationship joins them, remove the unrelated material or present separate maps instead of relying on a failed call and retry.

## Integrity

- Do not expose chain-of-thought. Map conclusions, inspectable support, uncertainty, decisions, and actions.
- Treat confidence as an agent-authored inspectable judgment. Never imply that it or the graph proves correctness.
- Do not turn headings into nodes merely to make the map larger.
- Do not silently convert implementer self-critique into independent review.

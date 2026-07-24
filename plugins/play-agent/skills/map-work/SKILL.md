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
3. Use only the tool's node kinds and directed relations. Titles must state the actual claim, evidence, risk, decision, work item, or architecture element rather than repeat category names.
4. Use `kanban_card` only for work that is formally tracked and independently actionable; keep an inferred or recommended next step as `action`. Use `c4_container` only for a C4 application or data store such as a service, web app, database, or queue, never for an arbitrary module or function. Do not imply that either kind creates a complete Kanban or C4 model.
5. Choose one explicit `entryNodeId`: the decision, finding, question, or work item the user should inspect first to understand the map. Choose it for reading value, not array order or graph centrality.
6. Connect every node into one meaningful graph. Do not invent edges to satisfy connectivity; remove irrelevant nodes instead.
7. Attach inspectable references to evidence and source-sensitive claims. Use `{"path":"src/file.ts","line":42}` for code, `{"label":"Source name","uri":"https://..."}` for links, or `{"label":"Interview","locator":"turn 18"}` for other precise locations. Never fabricate a reference or combine location forms in one reference.
8. Set provenance truthfully:
   - `implementer` when this task performed the implementation;
   - `reviewer` only in a genuinely separate review context;
   - `agent` for ordinary analysis;
   - `user` only for positions supplied by the user.
9. For every `claim`, `assumption`, and `lesson`, set qualitative `confidence` and a concrete `confidenceBasis`. For medium or low confidence, add one to three `uncertaintyReasons` that identify missing evidence, ambiguity, or an unresolved dependency. Do not add confidence fields to other node kinds.
10. Call `present_work_map`. Do not reproduce every node again in prose after the map renders.

Before the call, treat edges as undirected and verify that every node is reachable from `entryNodeId`. When the result contains separate clusters, connect them only through a real shared decision, review result, or action. If no truthful relationship joins them, remove the unrelated material or present separate maps instead of relying on a failed call and retry.

## Tool Delivery Contract

- Present the map only by calling the connected `present_work_map` MCP tool.
- Do not invoke the bundled MCP runtime through a shell, a temporary JSON-RPC file, or a direct process call. Those paths can test protocol output but cannot attach the MCP App to the active conversation.
- State that the map was presented only after the tool call succeeds. If the tool is unavailable or the call fails, report that limitation plainly and do not claim that the user can see a rendered map.
- When the plugin was just installed or updated and the tool is unavailable, tell the user to restart Codex and start a new task so the host reloads the versioned plugin path. Do not inspect, patch, copy, or preserve plugin-cache directories as a workaround.
- Do not substitute Mermaid, prose, or a manually opened static fixture for the requested Play Agent map unless the user explicitly asks for a different format.

## Integrity

- Do not expose chain-of-thought. Map conclusions, inspectable support, uncertainty, decisions, and actions.
- Treat confidence as an agent-authored inspectable judgment. Never imply that it or the graph proves correctness.
- Do not turn headings into nodes merely to make the map larger.
- Do not silently convert implementer self-critique into independent review.

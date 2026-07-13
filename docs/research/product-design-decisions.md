# Product Design Decisions

## MCP-Only

Play Agent does not ship a standalone website. The user already works inside Codex or another MCP Apps host.

## Stateless Presentation

The product unit is one immutable Work Map tool result. `present_work_map` is read-only and deterministic. There is no latest-map API, server-side session state, or mirror store.

## Explicit Graph

The caller supplies semantic nodes and directed edges. Play Agent validates but never infers or repairs relationships. The user does not manually fill graph forms.

## Compact Taxonomy

Node kinds represent claims, evidence, options, decisions, assumptions, risks, questions, actions, and lessons. Relation aliases are avoided because ambiguous vocabularies reduce model reliability and user comprehension.

## Provenance Before Confidence

Every map declares an author role, nodes can preserve a different origin, and evidence can carry inspectable references. A reviewer role means independent review, not implementer self-critique.

Qualitative confidence is limited to `claim`, `assumption`, and `lesson`, where the node represents an inferential judgment. It requires a basis, and medium or low confidence requires concrete uncertainty reasons. It is intentionally absent from evidence, decisions, risks, questions, options, and actions. Confidence helps direct follow-up work but never substitutes for provenance, references, or independent review.

## Work Map Only

The MCP App contains the map, map controls, and a temporary node detail overlay. A single node click selects it and automatically lays out its direct relationship neighborhood; `View details` opens the complete content separately. Nodes are not manually draggable, and reset returns to the deterministic global layout. The App does not contain a Selected Node sidebar, database inspector, form editor, or parallel chat UI.

## Host-Native Follow-Up

Node actions use the host's `sendFollowUpMessage` capability. If the host does not expose that capability, the actions are not shown; Play Agent does not implement a substitute conversation system.

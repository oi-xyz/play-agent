# Product Design Decisions

## MCP-Only

Play Agent does not ship a standalone website. The user already works inside Codex or another MCP Apps host.

## Stateless Presentation

The product unit is one immutable Work Map tool result. `present_work_map` is read-only and deterministic. There is no latest-map API, server-side session state, or mirror store.

## Explicit Graph

The caller supplies semantic nodes and directed edges. Play Agent validates but never infers or repairs relationships. The user does not manually fill graph forms.

## Compact Taxonomy

The core node kinds represent claims, evidence, options, decisions, assumptions, risks, questions, actions, and lessons. Two narrow domain kinds extend that set without a second-level taxonomy: `kanban_card` is formally tracked, independently actionable work, while `c4_container` is an application or data store at the C4 container abstraction. They do not imply full Kanban or C4 support. Relation aliases are avoided because ambiguous vocabularies reduce model reliability and user comprehension.

## Provenance Before Confidence

Every map declares an author role, nodes can preserve a different origin, and evidence can carry inspectable references. A reviewer role means independent review, not implementer self-critique.

Workspace code references preserve `path` and optional `line` as structured fields. URLs use `uri`, and document or transcript locations use `locator`. Each reference has exactly one location form; the server validates the supplied reference but does not reinterpret or repair it.

Qualitative confidence is limited to `claim`, `assumption`, and `lesson`, where the node represents an inferential judgment. It requires a basis, and medium or low confidence requires concrete uncertainty reasons. It is intentionally absent from evidence, decisions, risks, questions, options, actions, Kanban cards, and C4 containers. Confidence helps direct follow-up work but never substitutes for provenance, references, or independent review.

## Work Map Only

The MCP App contains the map, map controls, and a temporary responsive node Peek. A single node click highlights its direct relationship neighborhood without hiding nodes, changing layout, or moving the viewport. `Peek` opens complete content without replacing the current relationship selection: it appears beside the map on wider viewports and as a bottom sheet on narrow viewports. Relationship rows navigate within Peek with Back and Forward history, while references expose only host-supported source actions. Nodes and relationships are keyboard reachable, Escape restores focus, and `Go to start` returns to the explicit agent-authored entry node. Nodes are not manually draggable. The App does not contain a Selected Node sidebar, database inspector, form editor, or parallel chat UI.

Selection uses a stable spatial spotlight: the selected node and its direct relationship context remain legible while unrelated nodes recede without being removed. Every kind has a compact type icon that supplements, but never replaces, its text label and color. Pointer, focus, edge-direction, and node-to-Peek transitions are short, non-continuous, and disabled when the host requests reduced motion. Node cards never tilt or distort because text and edge geometry remain primary review surfaces.

Because the map is embedded in a conversation, ordinary wheel and trackpad scrolling belongs to the host conversation. The map zooms only from an explicit pinch gesture or its zoom buttons; drag-to-pan remains an intentional pointer action. This avoids an invisible activation mode and prevents the inline App from trapping routine conversation navigation.

The map requests the host's native fullscreen display mode when that capability is available. Fullscreen keeps the same map instance, selected node, filters, and detail state while fitting the graph to the expanded viewport. Unsupported hosts do not show this action; Play Agent does not simulate fullscreen with CSS overlays, external pages, or substitute windows.

## Host-Native Follow-Up

Node actions use the host's `sendFollowUpMessage` capability. If the host does not expose that capability, the actions are not shown; Play Agent does not implement a substitute conversation system.

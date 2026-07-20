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

The MCP App contains the map, map controls, and a temporary node detail overlay. A single node click highlights its direct relationship neighborhood without hiding nodes, changing layout, or moving the viewport. `View details` opens complete content without replacing the current relationship selection. Nodes are not manually draggable, and reset clears the selection and restores the deterministic global view. The App does not contain a Selected Node sidebar, database inspector, form editor, or parallel chat UI.

Because the map is embedded in a conversation, ordinary wheel and trackpad scrolling belongs to the host conversation. The map zooms only from an explicit pinch gesture or its zoom buttons; drag-to-pan remains an intentional pointer action. This avoids an invisible activation mode and prevents the inline App from trapping routine conversation navigation.

The map requests the host's native picture-in-picture and fullscreen display modes when that capability is available. PiP keeps the active map visible while the conversation continues, uses a compact toolbar, and provides an explicit path into fullscreen. Fullscreen returns to the mode it was opened from. Both transitions keep the same map instance, selected node, filters, and detail state while fitting the graph to the new viewport. Unsupported hosts do not show these actions; Play Agent does not simulate display modes with CSS overlays, external pages, or substitute windows.

PiP preserves the active mounted map; it does not claim to restore historical widgets after the host unmounts them. Play Agent remains stateless and does not add map IDs, latest-map pointers, or hidden persistence for this presentation feature.

## Host-Native Follow-Up

Node actions use the host's `sendFollowUpMessage` capability. If the host does not expose that capability, the actions are not shown; Play Agent does not implement a substitute conversation system.

# Core Workflow Audit

## Review A Substantial Result

1. Codex performs the work.
2. Codex calls `present_work_map` with a compact connected graph.
3. The host renders the Work Map MCP App.
4. The user inspects relationships, provenance, complete node content, and references.

Inferential nodes also expose qualitative confidence, its basis, and concrete reasons when confidence is not high. This directs follow-up without presenting confidence as verification.

Status: implemented.

## Continue From A Node

1. The user opens a node in the map-local focus overlay.
2. The user chooses `Ask why`, `Challenge`, or `Continue`.
3. The MCP App uses `sendFollowUpMessage` to post a focused prompt to the host conversation.

Status: implemented when the host exposes the Apps SDK capability.

## Independent Review

Reviewer-authored maps declare `authorRole: reviewer` and `reviewOf`. Implementer-origin nodes can remain marked as implementer while reviewer claims, risks, evidence, and actions remain visibly reviewer-authored.

Status: the provenance and overlay data model is implemented. Creating the isolated reviewer task remains the host or user's responsibility; Play Agent does not manage Codex tasks.

Reviewer nodes expose `Accept`, `Reject`, and `Accept & handoff`. These actions post the user's explicit decision to the host. The handoff prompt contains only the selected accepted finding and its references; Play Agent keeps no hidden acceptance state.

## Preserve Evidence

Evidence and source-sensitive claims can carry URI or locator references. The focus overlay exposes those references and uses the host's vetted external-link API for URIs.

Status: implemented.

## Removed Workflows

- selected-node chat;
- manual node forms;
- implementation/review agent execution;
- Kanban project state;
- Codex session management;
- persistent latest-map state;
- local fallback agent execution.

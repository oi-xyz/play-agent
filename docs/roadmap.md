# Play Agent Roadmap

Play Agent is a stateless MCP tool plus MCP App for presenting reviewable reasoning graphs inside the host conversation.

## Implemented Foundation

- `present_work_map` as the only MCP tool.
- Compact node and relation taxonomy.
- Explicit connected graph validation with no inferred edges.
- Provenance through `authorRole`, `reviewOf`, and node origin.
- Verifiable node references with URI or locator.
- Qualitative confidence for inferential nodes, with explicit reasons when confidence is not high.
- Deterministic snapshot ID and Dagre layout.
- Work Map-only MCP App with search, multi-type contextual highlighting, pan, zoom, fit view, relationship highlighting, and view reset.
- Host-first gesture handling so ordinary trackpad scrolling navigates the conversation while pinch gestures and explicit controls zoom the map.
- Readable large-map entry view and a navigable minimap so fit-all is optional rather than the unreadable default.
- Explicit separation between relationship selection and full detail viewing; opening details preserves the selected relationship context and global layout.
- Map-local node focus overlay with full content, relationships, and references.
- Host-native `Ask why`, `Challenge`, and `Continue` actions.
- Reviewer-only `Accept`, `Reject`, and accepted-finding handoff actions.
- No session manager, mirror store, latest-map pointer, compatibility schema, or local agent.
- Installable Codex Plugin manifest with a self-contained MCP runtime.
- `map-work` skill for selective, provenance-aware graph construction.
- `independent-review` skill with a hard isolation gate and explicit handoff semantics.

## Distribution Milestone

The free individual product is the Codex Plugin, not a standalone application. Validate local installation, skill triggering, MCP discovery, and inline rendering from a clean Codex task before submitting it to a broader marketplace.

Do not introduce accounts, billing, cloud persistence, or a subscription gate during this milestone. A future paid offering must be justified by repeated team-level value such as organization-specific review policy, evaluation packs, managed deployment, or audit requirements; it must not merely charge for the graph UI.

## Validation Milestone

The next work is product validation, not another surface expansion.

The paired study protocol, privacy boundary, provisional gates, and local scorecard are defined in `docs/evaluation.md`. Run `npm run evaluate -- <trials.jsonl>` after each study round; do not move thresholds after observing the results.

Run the same substantial tasks with structured prose and Play Agent. Measure:

- time to identify the evidence behind a decision;
- time to find unresolved assumptions and blockers;
- wrong-reference rate after returning later;
- ability to distinguish implementer claims from reviewer findings;
- usefulness and frequency of node follow-up actions;
- percentage of maps judged less useful than the original prose.

The map should be used only when relationships materially improve these outcomes.

## Reviewer Workflow Milestone

Validate the existing provenance model with independently isolated Codex reviewer tasks:

- reviewer receives an explicit implementation result or map;
- reviewer produces a reviewer-authored map with `reviewOf`;
- user accepts, rejects, or questions reviewer findings through map-local actions;
- `Accept & handoff` prepares a concise implementer packet containing only the selected accepted finding and its references.

Play Agent should not automate task discovery or maintain hidden handoff state unless the host later exposes a first-class task contract that preserves one source of truth.

## Layout And Host Coverage

- Test 5, 15, and 24-node maps with branching, multi-parent edges, and cycles.
- Verify inline and host-native fullscreen behavior in each target MCP Apps host, including context preservation and viewport fitting across transitions.
- Confirm follow-up and external-reference capabilities through feature detection.
- Keep tools decoupled from rendering and keep unsupported host limitations explicit.

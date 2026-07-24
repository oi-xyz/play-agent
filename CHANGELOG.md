# Changelog

## 0.1.6 - 2026-07-24

- Replace overlapping node type colors with distinct, mode-specific palettes for light and dark hosts.
- Add automated perceptual-distance and tag-contrast gates so future type colors cannot silently become ambiguous.
- Add a consistent icon vocabulary to node badges, type filters, and node details so type recognition does not depend on color alone.
- Give evidence, decision, risk, Kanban card, and C4 container nodes restrained semantic framing without adding type-specific schema or changing graph geometry.
- Require an explicit reading entry for every map, label it in the graph, and orient large-map reading around it without inferring importance.
- Add Apache-2.0 licensing, a privacy statement, plugin screenshots, and a direct Codex workflow link for clearer distribution.
- Replace the blocking detail overlay with responsive Peek, add navigable relationships and actionable references, and preserve the user's map selection while browsing.
- Make relationships directly selectable, emphasize the selected edge, and show the complete source-to-target statement.
- Add directional node navigation, relationship keyboard access, modal focus containment on narrow screens, focus restoration, and an explicit `Go to start` action.
- Add a spatial spotlight for selected nodes, compact type icons, node-to-Peek continuity, and one-shot directional edge feedback with reduced-motion support.
- Remove the unused picture-in-picture runtime, capability declaration, controls, and current-product documentation.
- Remove the ineffective host-dimension fullscreen workaround and restore the pre-experiment exit icon.
- Remove the visual relationship prompt shown after selecting an edge while preserving selection highlighting and accessible announcements.
- Require real `present_work_map` tool delivery before reporting a rendered map, forbid shell/runtime substitutes in both skills, and add a bundled-plugin MCP smoke test to CI.
- Start the bundled MCP server through a plugin-owned Node 20+ launcher that resolves common version-manager installations without relying on the Codex Desktop GUI `PATH`.
- Document and enforce the host reload boundary: restart Codex after reinstalling a versioned plugin, then verify rendering from a clean task without preserving or patching stale cache directories.
- Keep nodes stationary on hover, remove the inset C4 container frame, and refine relationship strokes and arrowheads for a quieter map.

## 0.1.5 - 2026-07-20

- Add a host-native picture-in-picture mode so users can keep the active Work Map visible while continuing the conversation.
- Add explicit PiP-to-fullscreen and fullscreen-to-PiP transitions that preserve map context.
- Use a compact PiP toolbar and fit the graph to the floating viewport without adding persistence or historical-widget substitutes.
- Respect the host's advertised display modes and surface rejected mode requests instead of leaving display controls silently unresponsive.
- Add flat `kanban_card` and `c4_container` node kinds with explicit, narrow semantics and distinct map colors.
- Explain node types in the filter, on node hover or keyboard focus, and in node details without adding taxonomy levels or a persistent legend.

## 0.1.4 - 2026-07-19

- Add a capability-gated toolbar action for the host's native fullscreen display mode.
- Preserve map selection and highlights while fitting the graph to the expanded fullscreen viewport.
- Hide fullscreen controls in unsupported hosts instead of simulating a substitute display surface.

## 0.1.3 - 2026-07-18

- Make workspace code references first-class with structured `path` and optional `line` fields.
- Make reference labels optional and provide exact reference examples in the tool and skill contracts.
- Return indexed validation issues instead of flattened repeated field errors when a tool call is invalid.

## 0.1.2 - 2026-07-17

- Reserve ordinary wheel and trackpad scrolling for the host conversation while keeping pinch-to-zoom and explicit map zoom controls.
- Smooth pinch zoom deltas to avoid abrupt scale jumps on high-resolution trackpads.

## 0.1.1 - 2026-07-17

- Keep the complete work map visible when selecting a node and highlight its direct relationship context in place.
- Separate node detail inspection from relationship selection so reviewing a neighbor does not replace the user's current context.
- Replace layout-reset language with a view reset that clears relationship highlighting and restores the deterministic overview.

## 0.1.0 - 2026-07-13

- Package Play Agent as an installable Codex Plugin with a bundled local MCP server.
- Present substantial agent work as an interactive, deterministic work map.
- Add independent review provenance and explicit reviewer handoff actions.
- Add inspectable qualitative confidence for claims, assumptions, and lessons.
- Add product evaluation gates for comparing work maps with structured prose.

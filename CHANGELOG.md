# Changelog

## 0.1.6 - Unreleased

- Replace overlapping node type colors with distinct, mode-specific palettes for light and dark hosts.
- Add automated perceptual-distance and tag-contrast gates so future type colors cannot silently become ambiguous.

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

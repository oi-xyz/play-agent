# Changelog

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

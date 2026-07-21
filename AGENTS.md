# Agent Notes

This project is intentionally Codex-Plugin-first:

- Product stage rule: this project is unreleased and has no backward-compatibility burden. When product direction, architecture, storage shape, or UI language needs to change, prefer the clearest design now. It is acceptable to delete, reshape, or replace old data structures, UI flows, docs, tests, local storage formats, and prototype code instead of preserving historical behavior.
- Play Agent is not a standalone frontend website. Do not reintroduce Vite/React app routes or a separate session-management UI. A generated, static GitHub Pages showcase is allowed only as documentation for representative Work Maps; it must reuse the production MCP App renderer, contain no product-only behavior, and clearly distinguish itself from the live Codex host experience.
- The distributable product is a Codex Plugin containing focused workflow skills and a bundled local MCP server. The server exposes an MCP App resource that the host renders inline at `ui://play-agent/work-map.html`.
- Keep the checked-in `plugins/play-agent/plugin-runtime/play-agent-mcp.mjs` bundle synchronized through `npm run build`; plugin installs must not depend on running `npm install` inside the plugin cache.
- The server must not manage Codex sessions or retain a latest-map pointer. It only validates, lays out, and returns the map explicitly passed to the MCP tool.
- Do not add fallback, supplement, mirror-store, simulator, or compatibility mechanisms for core product behavior. If a host cannot render MCP Apps, keep the structured tool result useful and state the limitation explicitly.
- `present_work_map` is the only product tool. The caller must provide explicit semantic `nodes`, provenance, verifiable references, and directed `edges`; the server validates the graph and must not infer, repair, synthesize, or persist relationships.
- `claim`, `assumption`, and `lesson` nodes require qualitative confidence plus a basis. Medium and low confidence also require concrete uncertainty reasons. Do not add confidence to evidence, decisions, risks, questions, options, actions, Kanban cards, or C4 containers.
- Use the compact node taxonomy in `src/types.ts`. Do not add overlapping node kinds or relation aliases without removing the ambiguity they introduce.
- Keep specialized kinds flat and narrow: `kanban_card` means formally tracked, independently actionable work; `c4_container` means a C4 application or data store. Neither kind implies a complete Kanban or C4 subsystem.
- The MCP App may use standard host capabilities such as `sendFollowUpMessage` and `openExternal`. Feature-detect them and do not add local substitutes when the host does not support them.
- The work map is a review artifact for a single answer/checkpoint, not a project-management database.

Useful commands:

```bash
npm run mcp
npm run build
npm run test
```

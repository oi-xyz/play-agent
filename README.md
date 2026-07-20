# Play Agent

Play Agent is a Codex Plugin that turns substantial agent work into a reviewable, two-dimensional reasoning map. It bundles two focused workflow skills with a stateless MCP tool and MCP App.

[Source](https://github.com/oi-xyz/play-agent) | [Issues](https://github.com/oi-xyz/play-agent/issues)

Codex remains the agent and conversation surface. Play Agent does not manage sessions, persist a mirror of the conversation, or run another model. It validates an explicit semantic graph, lays it out, and presents it inside the host conversation.

## Plugin Workflows

The plugin adds two skills:

- `map-work` decides when relational inspection is useful and calls `present_work_map` with a compact, truthful graph.
- `independent-review` reviews a supplied checkpoint from an isolated task, preserves reviewer and implementer provenance, and supports explicit acceptance or handoff.

The distinction matters: an implementer can map its own result, but it cannot label its self-check as independent review.

The plugin package includes a compact Play Agent mark derived from the product's play-and-graph concept and uses it for both directory and composer surfaces.

## Product Thesis

Long agent outputs bury their useful structure in prose. Users need to see:

- which claims are supported by which evidence;
- which assumptions remain unverified;
- which options were considered and what was decided;
- which risks block progress and what mitigates them;
- which questions remain open and which actions follow;
- whether a node came from the user, an implementer, or an independent reviewer.

The map is a navigation and review artifact, not proof that the agent's reasoning is correct. References and provenance make important nodes inspectable; an independent reviewer remains distinct from implementer self-assessment.

```text
Agent work           = prose and execution in the host
present_work_map     = explicit semantic graph
Play Agent MCP App   = visual inspection and follow-up surface
```

## Node Model

The node taxonomy is intentionally compact:

| Kind | Meaning |
| --- | --- |
| `claim` | A conclusion, finding, or recommendation |
| `evidence` | An observation or source that can support or contradict a claim |
| `option` | A candidate path that has not necessarily been selected |
| `decision` | A selected or committed direction |
| `assumption` | An unverified premise |
| `risk` | A failure mode or material concern |
| `question` | An unresolved inquiry |
| `action` | Concrete follow-up work |
| `kanban_card` | A formally tracked, independently actionable work item |
| `c4_container` | An application or data store at the C4 container abstraction |
| `lesson` | A durable insight worth carrying forward |

The two specialized kinds are deliberately narrow. `action` remains an inferred or recommended next step; use `kanban_card` only when that work is explicitly being tracked. `c4_container` means a C4 application or data store such as a service, web app, database, or queue, not an arbitrary module or function. These kinds do not imply a complete Kanban board or C4 modeling system, and they remain flat peers in the type filter.

The App explains these meanings where they are needed: the type filter includes a concise definition for every type present in the map, node type badges expose the same definition on hover or keyboard focus, and node details keep it visible for touch users. All three surfaces use the shared registry in `src/types.ts`.

### Confidence

Only `claim`, `assumption`, and `lesson` express inferential judgments, so only those kinds carry confidence:

- `high`, `medium`, or `low` rather than a falsely precise percentage;
- a concise `confidenceBasis` explaining why that level was chosen;
- one to three `uncertaintyReasons` whenever confidence is medium or low.

Evidence relies on inspectable references and provenance instead. Decisions are commitments, risks are failure modes, and actions and Kanban cards are work; C4 containers are architecture elements. Applying a generic confidence value to them would blur distinct concepts. Confidence remains an agent-authored judgment, not proof or independent verification.

Relations are directed and read from `from` to `to`:

```text
supports · contradicts · informs · depends_on · blocks
mitigates · resolves · leads_to · alternative_to
```

## Provenance And References

Every map has an `authorRole`: `user`, `agent`, `implementer`, or `reviewer`. A node may override that role when it originated elsewhere. `reviewer` should only be used for work produced in an independently reviewed context.

References are attached to nodes and use exactly one inspectable location: `path` with an optional 1-based `line` for workspace files, `uri` for links, or `locator` for a precise non-file location such as a document section or transcript turn. `label` is optional. This keeps code references structured instead of making the caller concatenate paths and lines into prose, and lets the user inspect a claim's basis independently of its qualitative confidence.

## User Journey

1. The user asks Codex to perform substantial work.
2. Codex calls `present_work_map` when relationships, evidence, alternatives, or follow-up work materially benefit from a map.
3. The MCP host renders `ui://play-agent/work-map.html` inline.
4. The user searches, filters, pans, zooms, opens a node to inspect its complete content, pins the active Work Map in the host's picture-in-picture surface, or expands it fullscreen when available.
5. In hosts that support the Apps SDK bridge, the user can choose `Ask why`, `Challenge`, or `Continue`; reviewer nodes additionally support `Accept`, `Reject`, and `Accept & handoff`. The MCP App sends the explicit user decision to the host conversation.

The tool should not be called for simple answers where a map adds no inspection value.

## MCP Contract

`present_work_map` requires:

- `title`
- `authorRole`
- optional `reviewOf` for an independent reviewer map
- `nodes[]`, limited to 24
- `edges[]`, limited to 48

For a multi-node map, all nodes must belong to one connected graph. The server rejects duplicate IDs, dangling edges, self-links, duplicate relationships, disconnected nodes, and references that do not contain exactly one of `path`, `uri`, or `locator`. It never invents missing edges.

```json
{
  "title": "Review the MCP product boundary",
  "authorRole": "reviewer",
  "reviewOf": "implementation-checkpoint-7",
  "nodes": [
    {
      "id": "evidence-host-ui",
      "kind": "evidence",
      "title": "The MCP protocol validates references before rendering",
      "references": [
        {
          "path": "server/mcpProtocol.ts",
          "line": 30
        }
      ]
    },
    {
      "id": "decision-mcp-first",
      "kind": "decision",
      "title": "Use Codex as the execution surface",
      "origin": "implementer"
    },
    {
      "id": "action-validate",
      "kind": "action",
      "title": "Validate the map with a real Codex task"
    }
  ],
  "edges": [
    {
      "from": "evidence-host-ui",
      "to": "decision-mcp-first",
      "relation": "supports"
    },
    {
      "from": "decision-mcp-first",
      "to": "action-validate",
      "relation": "leads_to"
    }
  ]
}
```

The same input produces the same snapshot ID and Dagre layout. The tool is read-only and keeps no latest-map state.

## MCP App

The App contains only the Work Map surface. It provides:

- smooth, directed, labeled edges and deterministic Dagre layout;
- search, multi-type highlighting with relationship context, fit view, explicit zoom controls, pinch-to-zoom, and drag-to-pan;
- host-first scrolling: ordinary wheel and trackpad scrolling stays with the Codex conversation instead of zooming the inline map;
- host-native display modes: capability-gated toolbar actions pin the active map in picture-in-picture or expand it fullscreen, preserve map context, and fit the graph to each viewport;
- single-click relationship highlighting that preserves the full map and its deterministic global layout;
- an explicit `View details` action that does not replace the current relationship selection;
- view reset; nodes are not manually draggable;
- provenance visible on every node;
- a map-local focus overlay with complete node content, relationships, and references;
- qualitative confidence on claims, assumptions, and lessons, including visible reasons when confidence is not high;
- a readable default viewport for large maps plus a navigable minimap and an explicit fit-all overview;
- host-native `Ask why`, `Challenge`, and `Continue` actions when `sendFollowUpMessage` is available;
- reviewer-only `Accept`, `Reject`, and `Accept & handoff` actions. The handoff prompt contains only the accepted finding and its references.

There is no Selected Node sidebar, form editor, Kanban database, or local chat implementation.

## Install

Requirements:

- Codex with Plugin support;
- Node.js 20 or newer, available as `node` on `PATH`.

Add the public OI XYZ marketplace and install Play Agent:

```bash
codex plugin marketplace add oi-xyz/play-agent --ref main
codex plugin add play-agent@oi-xyz
```

Start a new Codex task after installation so its skills and bundled MCP server are discovered. Ask Codex to map substantial work directly, or invoke one of the plugin skills with `@`.

## Update

Refresh the public marketplace snapshot, then reinstall Play Agent from it:

```bash
codex plugin marketplace upgrade oi-xyz
codex plugin add play-agent@oi-xyz
```

Start a new Codex task after updating so the task loads the new skills, MCP server, and App resource.

## Development

Build the self-contained runtime used by plugin installs:

```bash
npm run build
```

The generated `plugins/play-agent/plugin-runtime/play-agent-mcp.mjs` includes its package dependencies. Plugin users do not run `npm install` inside the Codex plugin cache.

For local protocol development, run the stdio server directly:

```bash
npm run mcp
```

The process waits for newline-delimited JSON-RPC. This command is for development only; installed users should use the plugin's bundled MCP configuration rather than adding a second standalone server.

## Verify

```bash
npm run build
npm run test
python3 /path/to/skill-creator/scripts/quick_validate.py plugins/play-agent/skills/map-work
python3 /path/to/skill-creator/scripts/quick_validate.py plugins/play-agent/skills/independent-review
python3 /path/to/plugin-creator/scripts/validate_plugin.py plugins/play-agent
```

For paired product validation against structured prose, follow `docs/evaluation.md` and summarize local observations with:

```bash
npm run evaluate -- /path/to/trials.jsonl
```

## Non-Goals

- No standalone website or Codex session manager.
- No persistent or mirror store.
- No Pi/local deterministic agent path.
- No inferred graph or compatibility schema.
- No generic whiteboard or manual node editor.
- No account, billing, subscription gate, or cloud control plane before product validation establishes repeated value.
